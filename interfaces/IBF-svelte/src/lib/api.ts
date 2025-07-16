const API_BASE_URL = 'http://localhost:3000/api';

interface IbfLayerMetadata {
  id: string;
  name: string;
  label: string;
  type: 'wms' | 'poi' | 'shape' | 'line';
  active: string;
  legendColor: {
    type: 'icon' | 'point' | 'circle' | 'gradient';
    svg?: string;
    color?: string;
    colors?: string[];
  };
  leadTimeDependent: boolean;
  description: any;
}

class ApiService {
  private async get(endpoint: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getLayers(countryCodeISO3: string, disasterType: string): Promise<IbfLayerMetadata[]> {
    return this.get(`metadata/layers/${countryCodeISO3}/${disasterType}`);
  }

  async getCountries() {
    return this.get('countries');
  }

  async getAdminAreas(countryCodeISO3: string, adminLevel: number = 2) {
    return this.get(`admin-area-data/${countryCodeISO3}/${adminLevel}`);
  }
}

export const apiService = new ApiService();
export type { IbfLayerMetadata };
