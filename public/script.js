document.addEventListener('DOMContentLoaded', function() {
    const infoDiv = document.getElementById('deployment-info');
    
    // Function to fetch info from the API
    async function fetchDeploymentInfo() {
        try {
            const response = await fetch('/api/info');
            const data = await response.json();
            
            // Format the data for display
            const formattedInfo = JSON.stringify(data, null, 2);
            infoDiv.textContent = formattedInfo;
            
            // Add deployment timestamp to the page
            const timestampElement = document.createElement('p');
            timestampElement.textContent = `Last updated: ${new Date().toLocaleString()}`;
            timestampElement.className = 'timestamp';
            document.querySelector('.info-box').appendChild(timestampElement);
            
        } catch (error) {
            infoDiv.textContent = 'Error fetching deployment information';
            infoDiv.className = 'error';
        }
    }
    
    // Call the function
    fetchDeploymentInfo();
});