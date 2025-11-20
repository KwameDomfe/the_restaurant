# Run Django development server accessible from network
Write-Host "Starting Django server on 0.0.0.0:8000..." -ForegroundColor Green
Write-Host "Server will be accessible at:" -ForegroundColor Cyan
Write-Host "  - http://localhost:8000/" -ForegroundColor Yellow
Write-Host "  - http://127.0.0.1:8000/" -ForegroundColor Yellow
Write-Host "  - http://192.168.62.227:8000/ (current network IP)" -ForegroundColor Yellow
Write-Host ""
python manage.py runserver 0.0.0.0:8000
