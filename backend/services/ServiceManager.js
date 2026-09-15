class ServiceManager {
    constructor() {
        this.services = {
            'analytics': { status: 'online', url: 'http://analytics-service:3000' },
            'market-data': { status: 'online', url: 'http://data-service:3001' }
        };
    }

    checkHealth(serviceName) {
        const service = this.services[serviceName];
        if (!service) return 'unknown';
        // Logic to ping service
        return service.status;
    }

    getStatusReport() {
        return this.services;
    }
}

module.exports = new ServiceManager();
