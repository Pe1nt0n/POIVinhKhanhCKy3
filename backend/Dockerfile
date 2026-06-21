# Stage 1: Build C# API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["src/Quan4CulinaryTourism.Api/Quan4CulinaryTourism.Api.csproj", "src/Quan4CulinaryTourism.Api/"]
RUN dotnet restore "src/Quan4CulinaryTourism.Api/Quan4CulinaryTourism.Api.csproj"

# Copy everything else and build
COPY src/ src/
WORKDIR "/src/src/Quan4CulinaryTourism.Api"
RUN dotnet build "Quan4CulinaryTourism.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Quan4CulinaryTourism.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Serve using ASP.NET Runtime (Alpine for small size)
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app
EXPOSE 8080

# Switch to non-root user for security
RUN adduser -D -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .

# Set Environment Variables for Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Quan4CulinaryTourism.Api.dll"]
