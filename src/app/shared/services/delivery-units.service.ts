import { Injectable } from '@angular/core';

export interface DeliveryUnit {
  id: number;
  code: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryUnitsService {
  private deliveryUnits: DeliveryUnit[] = [
    { id: 1, code: 'DU1', name: 'Digital Solutions', description: 'Web and mobile application development' },
    { id: 2, code: 'DU2', name: 'Cloud Services', description: 'Cloud infrastructure and DevOps' },
    { id: 3, code: 'DU3', name: 'Data Analytics', description: 'Business intelligence and data processing' },
    { id: 4, code: 'DU4', name: 'Quality Assurance', description: 'Testing and quality management' },
    { id: 5, code: 'DU5', name: 'Product Design', description: 'UI/UX design and user experience' },
    { id: 6, code: 'DU6', name: 'Integration Services', description: 'API development and system integration' },
    { id: 7, code: 'DU7', name: 'Security Solutions', description: 'Cybersecurity and compliance' },
    { id: 8, code: 'DU8', name: 'Innovation Lab', description: 'Research and emerging technologies' }
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

  getDeliveryUnitIds(): number[] {
    return this.deliveryUnits.map(du => du.id);
  }

  getDeliveryUnitById(id: number): DeliveryUnit | undefined {
    return this.deliveryUnits.find(du => du.id === id);
  }
}