$apiUrl = "http://localhost:5000/map/map-lesson-plan"

# Mock nodes data (cards) with English content
$nodes = @(
    @{
        id = "card-1"
        data = @{
            label = "Objective: Understand Photosynthesis"
            description = "Students will be able to describe the process of photosynthesis and explain its importance to the ecosystem."
            tag = "Objective"
        }
    },
    @{
        id = "card-2"
        data = @{
            label = "Strategy: Inquiry-Based Learning"
            description = "Encourage students to ask questions about how plants get food, and guide them to explore the answers through experiments."
            tag = "Strategy"
        }
    },
    @{
        id = "card-3"
        data = @{
            label = "Activity: The Leaf Experiment"
            description = "Students will place a leaf in a dark room for 24 hours, then expose it to light to observe the changes, proving the need for sunlight in photosynthesis."
            tag = "Activity"
        }
    },
    @{
        id = "card-4"
        data = @{
            label = "Resource: Educational Video"
            description = "Provide a link to a short animated video explaining the chemical process of photosynthesis in simple terms."
            tag = "Resource"
        }
    }
)

# Mock edges data, representing connections and flow
$edges = @(
    @{
        id = "edge-1"
        source = "card-2"
        target = "card-3"
        data = @{ label = "Apply strategy" }
    },
    @{
        id = "edge-2"
        source = "card-3"
        target = "card-1"
        data = @{ label = "Achieve objective" }
    }
)

# Construct the request body as a PowerShell object
$bodyData = @{
    nodes = $nodes
    edges = $edges
}

# Convert the object to a JSON string
$bodyJson = $bodyData | ConvertTo-Json -Depth 5

# Set request headers, explicitly specifying JSON with UTF-8 charset
$headers = @{
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "Sending request to the API..."

try {
    # Use Invoke-RestMethod to send the POST request and save the response to a file
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $bodyJson -OutFile "english_test_lesson_plan.docx"

    Write-Host "Success! File has been saved as english_test_lesson_plan.docx" -ForegroundColor Green
    
} catch {
    Write-Host "Request failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $responseText = $reader.ReadToEnd()
        Write-Host "Server returned an error:"
        Write-Host $responseText
    } else {
        Write-Host "Network or client error:"
        Write-Host $_.Exception.Message
    }
}