import { Repository, SelectQueryBuilder } from "typeorm"; // Importa SelectQueryBuilder
import { TicketRepository } from "../../repositories/TicketRepository";
import { AppDataSource } from "../../data-source";
import { TicketDAO } from "../../models/DAO/TicketDAO";
import { StatusType } from "../../models/StatusType";
import { RoleType } from "../../models/RoleType";

// --- Mocking di TypeORM ---

// Mock completo del QueryBuilder
const mockQueryBuilder = {
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
} as unknown as SelectQueryBuilder<TicketDAO>; // Cast a SelectQueryBuilder

// Mock completo del Repository
const mockRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  // Ora createQueryBuilder restituisce il nostro mockQueryBuilder
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
} as unknown as Repository<TicketDAO>; // Cast a Repository

// Mockiamo AppDataSource.getRepository per restituire il nostro mockRepository
jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepository);

describe('TicketRepository', () => {
  let ticketRepository: TicketRepository;

  beforeEach(() => {
    ticketRepository = new TicketRepository();
    jest.clearAllMocks(); // Resetta tutti i mock

    // Resetta i mock del repository
    (mockRepository.find as jest.Mock).mockClear();
    (mockRepository.findOneBy as jest.Mock).mockClear();
    (mockRepository.createQueryBuilder as jest.Mock).mockClear();
    (mockRepository.save as jest.Mock).mockClear();
    (mockRepository.create as jest.Mock).mockClear();
    (mockRepository.delete as jest.Mock).mockClear();

    // Resetta i mock del query builder
    (mockQueryBuilder.innerJoin as jest.Mock).mockClear().mockReturnThis(); // Ritorna 'this' per la concatenazione
    (mockQueryBuilder.where as jest.Mock).mockClear().mockReturnThis(); // Ritorna 'this' per la concatenazione
    (mockQueryBuilder.getMany as jest.Mock).mockClear();
  });

  // ... (il resto dei test è lo stesso, ma ora le chiamate ai mock funzioneranno)
  // Esempio per findByServiceIdStatus
  describe('findByServiceIdStatus', () => {
    it('should return tickets by service ID and status', async () => {
      const mockTickets = [{ id: 1, status: StatusType.open, service: { id: 10 } as any }] as TicketDAO[];
      // Qui si configura il mock di getMany, che fa parte del mockQueryBuilder
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockTickets);

      const tickets = await ticketRepository.findByServiceIdStatus(10, StatusType.open);

      expect(tickets).toEqual(mockTickets);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('ticket');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith( // Usa mockQueryBuilder qui
        "ticket.service", "service", "service.id = :serviceId", { serviceId: 10 }
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith( // Usa mockQueryBuilder qui
        "ticket.status = :status", { status: StatusType.open }
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalledTimes(1); // Usa mockQueryBuilder qui
    });
  });

  // ... (e così via per tutti i test che usano createQueryBuilder)

  // Esempio per findAll
  describe('findAll', () => {
    it('should return all tickets', async () => {
      const mockTickets = [{ id: 1, status: StatusType.open, service: {} as any }] as TicketDAO[];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockTickets); // Cast esplicito

      const tickets = await ticketRepository.findAll();

      expect(tickets).toEqual(mockTickets);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  // Esempio per updateStatus
  describe('updateStatus', () => {
    it('should update the status of an existing ticket', async () => {
      const existingTicket = { id: 1, status: StatusType.open, service: {} as any } as TicketDAO;
      const updatedTicket = { ...existingTicket, status: StatusType.closed };
      
      (mockRepository.findOneBy as jest.Mock).mockResolvedValue(existingTicket); // Cast esplicito
      (mockRepository.save as jest.Mock).mockResolvedValue(updatedTicket); // Cast esplicito

      const result = await ticketRepository.updateStatus(1, StatusType.closed);

      expect(result).toEqual(updatedTicket);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedTicket);
    });
    // ...
  });
});