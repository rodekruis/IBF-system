    <div class="ibf-dashboard-container">
    <h2>{{pageTitle}}</h2>
    <iframe id="ibf-dashboard-iframe" src="{{iframeUrl}}" width="100%" height="600" frameborder="0">
        <p>Your browser does not support iframes. Please <a href="{{iframeUrl}}" target="_blank">open the IBF Dashboard in a new window</a>.</p>
    </iframe>
</div>

<style>
.ibf-dashboard-container {
    padding: 20px;
}

.ibf-dashboard-container iframe {
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>
        right: 10px;
    }

    /* Loading state */
    .ibf-dashboard-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        font-size: 16px;
        color: #666;
    }

    .ibf-dashboard-loading::before {
        content: '';
        width: 20px;
        height: 20px;
        border: 2px solid #e3e3e3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Page header styles */
    .ibf-page-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
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
