# Multi-stage build for .NET 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files to cache restoring layers
COPY backend/LJVetClinic.API/LJVetClinic.API.csproj backend/LJVetClinic.API/
COPY backend/LJVetClinic.Application/LJVetClinic.Application.csproj backend/LJVetClinic.Application/
COPY backend/LJVetClinic.Domain/LJVetClinic.Domain.csproj backend/LJVetClinic.Domain/
COPY backend/LJVetClinic.Infrastructure/LJVetClinic.Infrastructure.csproj backend/LJVetClinic.Infrastructure/

# Restore dependencies
RUN dotnet restore backend/LJVetClinic.API/LJVetClinic.API.csproj

# Copy all source files
COPY backend/ backend/

# Build and publish the release application
WORKDIR /src/backend/LJVetClinic.API
RUN dotnet publish -c Release -o /app/publish

# Use runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose HTTP port and setup production env
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "LJVetClinic.API.dll"]
