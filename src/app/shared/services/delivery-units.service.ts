import { Injectable } from '@angular/core';

export interface DeliveryUnit {
  code: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryUnitsService {
  private deliveryUnits: DeliveryUnit[] = [
    { code: 'DU1', name: 'Digital Solutions', description: 'Web and mobile application development' },
    { code: 'DU2', name: 'Cloud Services', description: 'Cloud infrastructure and DevOps' },
    { code: 'DU3', name: 'Data Analytics', description: 'Business intelligence and data processing' },
    { code: 'DU4', name: 'Quality Assurance', description: 'Testing and quality management' },
    { code: 'DU5', name: 'Product Design', description: 'UI/UX design and user experience' },
    { code: 'DU6', name: 'Integration Services', description: 'API development and system integration' },
    { code: 'DU7', name: 'Security Solutions', description: 'Cybersecurity and compliance' },
    { code: 'DU8', name: 'Innovation Lab', description: 'Research and emerging technologies' }
  ];

  getDeliveryUnits(): DeliveryUnit[] {
    return this.deliveryUnits;
  }

  getDeliveryUnitByCode(code: string): DeliveryUnit | undefined {
    return this.deliveryUnits.find(du => du.code === code);
  }

  getDeliveryUnitCodes(): string[] {
    return this.deliveryUnits.map(du => du.code);
  }

  getDeliveryUnitNames(): string[] {
    return this.deliveryUnits.map(du => du.name);
  }
}