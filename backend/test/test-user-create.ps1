# PowerShell script to test /user/create endpoint

# Define the API URL
$apiUrl = "http://127.0.0.1:5000/user/create"

# Define user data
$body = @{
    email = "test@example.com"
    nickname = "TestUser"
} | ConvertTo-Json

# Make the request
$response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"

# Output the result
Write-Host "Status: OK"
Write-Host "Message: $($response.message)"
Write-Host "User ID: $($response.user_id)"
