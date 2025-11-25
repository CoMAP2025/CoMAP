# user_session_chat.ps1
# PowerShell script to test user/session/chat API flow

# Create User
$userBody = @{
    user_id = "testuser001"
    email = "testuser001@example.com"
    nickname = "Tester"
} | ConvertTo-Json

$userResponse = Invoke-RestMethod -Uri "http://127.0.0.1:5000/user/create" -Method POST -Body $userBody -ContentType "application/json"
Write-Host "`nResponse from /user/create:"
Write-Host ($userResponse | ConvertTo-Json -Depth 10)

# Create Chat Session
$sessionBody = @{
    user_id = "testuser001"
} | ConvertTo-Json

$sessionResponse = Invoke-RestMethod -Uri "http://127.0.0.1:5000/chat/create" -Method POST -Body $sessionBody -ContentType "application/json"
Write-Host "`nResponse from /chat/create:"
Write-Host ($sessionResponse | ConvertTo-Json -Depth 10)

$sessionId = $sessionResponse.session_id

# Prepare the map JSON as a PowerShell array of hashtables
$map = @(
    @{
        id = 1
        tag = "学习者"
        title = "Second year students"
        description = "I'm not quite sure what cognitive state students are in at this stage yet"
        sources = @("教师")
    }
)

$generateBody = @{
    session_id = $sessionId
    user_msg = "I'd like to design an interdisciplinary course on the subject of combustible ice"
    map = $map
} | ConvertTo-Json -Depth 10

$generateResponse = Invoke-RestMethod -Uri "http://127.0.0.1:5000/chat/generate" -Method POST -Body $generateBody -ContentType "application/json"

Write-Host "`nResponse from /chat/generate:"
Write-Host ($generateResponse | ConvertTo-Json -Depth 10)
