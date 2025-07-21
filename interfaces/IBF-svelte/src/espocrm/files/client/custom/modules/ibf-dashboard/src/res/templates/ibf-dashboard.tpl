<div class="ibf-dashboard-fullscreen">
    <iframe id="ibf-dashboard-iframe" src="{{iframeUrl}}" width="100%" height="100%" frameborder="0">
        <p>Your browser does not support iframes. Please <a href="{{iframeUrl}}" target="_blank">open the IBF Dashboard in a new window</a>.</p>
    </iframe>
</div>

<style>
/* Fullscreen container that fills the entire content area */
.ibf-dashboard-fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
}

/* Iframe fills the entire container */
.ibf-dashboard-fullscreen iframe {
    border: none;
    display: block;
    width: 100% !important;
    height: 100% !important;
    min-height: 100vh;
}

/* Override any EspoCRM content padding/margins */
.page[data-scope="IBFDashboard"] .page-content {
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden;
}

.page[data-scope="IBFDashboard"] .content {
    padding: 0 !important;
    margin: 0 !important;
    height: calc(100vh - 60px); /* Subtract header height */
    overflow: hidden;
}

/* Ensure the main container takes full space */
.page[data-scope="IBFDashboard"] {
    height: 100vh;
}

/* Page header styling */
.ibf-page-header {
    padding: 15px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e5e5e5;
}

.ibf-page-header h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
    font-weight: 600;
}

.ibf-page-header .breadcrumb {
    margin: 5px 0 0 0;
    background: none;
    padding: 0;
    font-size: 13px;
}

.ibf-page-header .breadcrumb li {
    color: #777;
}

.ibf-page-header .breadcrumb li + li:before {
    content: ">";
    padding: 0 8px;
    color: #ccc;
}

/* Dashboard controls */
.ibf-dashboard-container {
    position: relative;
    height: 100%;
    width: 100%;
}

.ibf-dashboard-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.fullscreen-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}

.fullscreen-button:hover {
    background: #0056b3;
}

.ibf-dashboard-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    color: #666;
}
</style>

<div class="page-header ibf-page-header">
    <h1>IBF Dashboard</h1>
    <ol class="breadcrumb">
        <li>EspoCRM</li>
        <li class="active">IBF Dashboard</li>
    </ol>
</div>

<div class="ibf-dashboard-container">
    <div class="ibf-dashboard-controls">
        <button class="fullscreen-button" data-action="toggleFullscreen">
            ⛶ Fullscreen
        </button>
    </div>
    
    <div class="ibf-dashboard-loading">
        Loading IBF Dashboard...
    </div>
    
    <iframe 
        id="ibf-dashboard-main-frame" 
        src="{{iframeUrl}}"
        style="width: 100%; height: 100%; border: none; display: none;"
        frameborder="0"
        allowfullscreen 
        allow="fullscreen"
        onload="this.style.display='block'; this.parentElement.querySelector('.ibf-dashboard-loading').style.display='none';">
    </iframe>
</div>
