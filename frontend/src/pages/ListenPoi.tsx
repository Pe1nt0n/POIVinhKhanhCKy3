import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePoiStore } from '../store/usePoiStore';
import { t } from '../utils/translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const ListenPoi: React.FC = () => {
  const { poiId } = useParams<{ poiId: string }>();
  const { pois, isSyncing, initOfflineData, syncWithServer, language } = usePoiStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Analytics & Rating state
  const hasTrackedPlayRef = useRef(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchReviews = async () => {
    if (!poiId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/poi/${poiId}/reviews`);
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [poiId]);

  // Initialize data if someone visits this URL directly
  useEffect(() => {
    if (pois.length === 0 && !isSyncing) {
      initOfflineData().then(() => syncWithServer());
    }
  }, [pois.length, isSyncing, initOfflineData, syncWithServer]);

  const poi = pois.find(p => p.id === poiId);

  useEffect(() => {
    // If audio is already playing, this syncs the state
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      if (poiId) {
        const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);
        
        fetch(`${API_BASE_URL}/api/v1/analytics/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            events: [{
              eventType: 'audio_play',
              poiId: poiId,
              deviceId: deviceId,
              sessionId: deviceId
            }]
          })
        }).catch(err => console.error('Failed to track audio play', err));
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [poi?.audio_url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSubmitReview = async () => {
    if (hasRated || !poiId || rating === 0) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/poi/${poiId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: rating, comment: comment })
      });
      if (res.ok) {
        setHasRated(true);
        fetchReviews(); // Refresh the list
      }
    } catch (e) {
      console.error('Failed to submit review', e);
    }
  };

  if (!poi) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#e65100] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{t(language, 'loading')}</p>
        </div>
      </div>
    );
  }

  const audioUrl = poi.audio_url ? `${API_BASE_URL}${poi.audio_url}` : '';

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#e65100] to-orange-400 -z-0 opacity-10"></div>
      
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-sm z-10 sticky top-0">
        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-[#e65100] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold text-sm">{t(language, 'backToMap')}</span>
        </Link>
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-[#e65100] font-bold text-sm">VK</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 max-w-md mx-auto w-full">
        {/* Cover Image or Placeholder */}
        <div className="w-40 h-40 bg-white rounded-full shadow-2xl mb-8 flex items-center justify-center p-2 relative">
          <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr ${isPlaying ? 'from-orange-500 to-yellow-400 animate-spin-slow' : 'from-gray-200 to-gray-300'} transition-all duration-500`}>
             {poi.images && poi.images.length > 0 ? (
               <img src={`${API_BASE_URL}${poi.images[0]}`} alt={poi.name} className="w-full h-full object-cover" />
             ) : (
               <svg className={`w-16 h-16 ${isPlaying ? 'text-white' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
               </svg>
             )}
          </div>
          {/* Decorative sound waves */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-50"></div>
              <div className="absolute -inset-4 rounded-full border border-orange-300 animate-ping opacity-30 animation-delay-300"></div>
            </>
          )}
        </div>

        {/* POI Info */}
        <div className="text-center mb-10 w-full">
          <span className="inline-block px-3 py-1 bg-orange-100 text-[#e65100] text-xs font-bold uppercase tracking-widest rounded-full mb-3">
            {poi.category || t(language, 'discoveryPoint')}
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
            {poi.name}
          </h1>
          <p className="text-sm text-gray-500 line-clamp-3 px-4">
            {poi.description}
          </p>
        </div>

        {/* Audio Player Controls */}
        {audioUrl ? (
          <div className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col items-center">
            <audio ref={audioRef} src={audioUrl} className="hidden" />
            
            <button 
              onClick={togglePlay}
              className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#e65100] to-orange-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all mb-6 focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              {isPlaying ? (
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            
            <div className="w-full flex items-center justify-center gap-2">
               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                 {isPlaying ? t(language, 'playingAudio') : t(language, 'tapToListen')}
               </span>
            </div>
            
            {/* Standard native HTML5 audio control as fallback/progress bar */}
            <div className="w-full mt-4">
               <audio controls src={audioUrl} className="w-full h-8 opacity-70" />
            </div>
          </div>
        ) : (
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl text-sm font-medium border border-red-100">
            {t(language, 'noAudio')}
          </div>
        )}

        {/* Rating Section */}
        <div className="w-full mt-6 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">
            {t(language, 'rateThisPlace')}
          </h3>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => !hasRated && setRating(star)}
                disabled={hasRated}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  rating >= star 
                    ? 'text-yellow-400 bg-yellow-50' 
                    : 'text-gray-300 bg-gray-50 hover:bg-yellow-50 hover:text-yellow-400'
                }`}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
          
          {!hasRated ? (
            <div className="w-full">
              <textarea
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                rows={3}
                placeholder="Nhập nội dung bình luận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button 
                onClick={handleSubmitReview}
                disabled={rating === 0}
                className="w-full bg-[#e65100] text-white py-2 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                Gửi Đánh Giá
              </button>
            </div>
          ) : (
            <p className="text-green-600 text-sm font-medium mt-1 animate-fade-in">
              {t(language, 'thanksForRating', rating.toString())}
            </p>
          )}
        </div>

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="w-full mt-6 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col">
             <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">
              Đánh giá từ du khách
            </h3>
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-3 h-3 ${star <= rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {rev.comment && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rev.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};
