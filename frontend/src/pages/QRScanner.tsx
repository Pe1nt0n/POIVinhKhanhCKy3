import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

export const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setHasPermission(true);
          html5QrCode = new Html5Qrcode("reader");
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              // On success
              html5QrCode.stop().then(() => {
                // If it's a URL of our app, navigate to it
                try {
                  const url = new URL(decodedText);
                  if (url.pathname.startsWith('/listen/')) {
                    navigate(url.pathname);
                  } else {
                    // Just navigate or open if it's external, for now let's just go to it if it's safe
                    window.location.href = decodedText;
                  }
                } catch {
                  // Not a valid URL, ignore or show error
                  setError('Mã QR không hợp lệ: ' + decodedText);
                  // Restart scanner after 2 seconds
                  setTimeout(() => startScanner(), 2000);
                }
              }).catch(err => {
                console.error("Failed to stop scanner", err);
              });
            },
            (errorMessage) => {
              // Ignore scan failures (happens every frame when no QR is found)
            }
          );
        } else {
          setHasPermission(false);
          setError('Không tìm thấy camera trên thiết bị của bạn.');
        }
      } catch (err) {
        setHasPermission(false);
        setError('Không thể truy cập camera. Vui lòng cấp quyền camera trong cài đặt trình duyệt.');
        console.error(err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white absolute top-0 w-full z-10">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold">Quét Mã QR</span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Scanner View */}
      <div className="flex-1 flex items-center justify-center relative">
        <div id="reader" className="w-full max-w-md bg-black overflow-hidden relative"></div>
        
        {/* Overlay targeting box is handled by html5-qrcode, but we can add styling if needed */}
        {hasPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">
              <svg className="w-12 h-12 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-semibold">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-black/80 text-white text-center pb-12">
        <p className="text-sm text-gray-300">
          Hãy đưa mã QR vào trong khung hình để hệ thống tự động quét và phát thuyết minh.
        </p>
      </div>
    </div>
  );
};
