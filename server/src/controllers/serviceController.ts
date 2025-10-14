import { Service } from "../models/DTO/Service";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { mapServiceDAOToDTO } from "../services/mapperService";
import { mapServiceDTOToDAO } from "../services/mapperService";
import { NotFoundError } from "../models/errors/NotFoundError";

/**
 * Get all services
 */
export async function getServices(): Promise<Service[]> {
  const serviceRepo = new ServiceRepository();
  const services = await serviceRepo.findAll();
  return services.map(mapServiceDAOToDTO);
}

/**
 * Get a service by ID
 */
export async function getService(id: number): Promise<Service> {
  const serviceRepo = new ServiceRepository();
  const service = await serviceRepo.findById(id);
  if (!service) {
    throw new NotFoundError(`Service with ID ${id} not found`);
  }
  return mapServiceDAOToDTO(service);
}

/**
 * Get all services managed by a specific desk
 */
export async function getServicesByDeskId(deskId: number): Promise<Service[]> {
  const serviceRepo = new ServiceRepository();
  const services = await serviceRepo.findByDeskId(deskId);
  return services.map(mapServiceDAOToDTO);
}

/**
 * Create a new service
 */
export async function createService(serviceDto: Service): Promise<Service> {
  const serviceRepo = new ServiceRepository();
  const serviceDao = mapServiceDTOToDAO(serviceDto);
  const createdService = await serviceRepo.create(serviceDao);
  return mapServiceDAOToDTO(createdService);
}

/**
 * Update an existing service
 */
export async function updateService(id: number, serviceDto: Service): Promise<Service> {
  const serviceRepo = new ServiceRepository();
  const serviceDaoPartial = mapServiceDTOToDAO(serviceDto);
  const updatedService = await serviceRepo.update(id, serviceDaoPartial);
  if (!updatedService) {
    throw new NotFoundError(`Service with ID ${id} not found`);
  }
  return mapServiceDAOToDTO(updatedService);
}

/**
 * Delete a service
 */
export async function deleteService(id: number): Promise<void> {
  const serviceRepo = new ServiceRepository();
  const deleted = await serviceRepo.delete(id);
  if (!deleted) {
    throw new NotFoundError(`Service with ID ${id} not found`);
  }
}