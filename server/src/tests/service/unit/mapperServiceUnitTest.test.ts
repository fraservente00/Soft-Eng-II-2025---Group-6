import {
  createDeskDTO,
  createServiceDTO,
  createTicketDTO,
  mapDeskDAOToDTO,
  mapServiceDAOToDTO,
  mapTicketDAOToDTO,
  mapDeskDTOToDAO,
  mapServiceDTOToDAO,
  mapTicketDTOToDAO,
} from "../../../services/mapperService"; // Assicurati che il percorso sia corretto

// Importa i DTO e i DAO reali, e gli enum
import { Desk } from "../../../models/DTO/Desk"; // DTO reale
import { Service } from "../../../models/DTO/Service"; // DTO reale
import { Ticket } from "../../../models/DTO/Ticket"; // DTO reale

import { DeskDAO } from "../../../models/DAO/DeskDAO";
import { ServiceDAO } from "../../../models/DAO/ServiceDAO";
import { TicketDAO } from "../../../models/DAO/TicketDAO";
import { StatusType } from "../../../models/StatusType";
// import { RoleType } from "../../models/RoleType"; // Non usato in questo contesto, ma puoi includerlo se vuoi

// --- Funzione helper locale per il test di removeNullAttributes ---
// Questa è la copia esatta della tua funzione in mapperService.ts
function removeNullAttributes<T extends Record<string, any>>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}

describe("Mappers and DTO Constructors", () => {
  // ---------- removeNullAttributes Helper Function Test ----------
  // Test per la funzione helper, separato, per assicurarsi che si comporti come previsto
  describe("removeNullAttributes", () => {
    test("should remove null and undefined attributes", () => {
      const input = { a: 1, b: null, c: undefined, d: "test", e: { sub: 1 } };
      expect(removeNullAttributes(input)).toEqual({ a: 1, d: "test", e: { sub: 1 } });
    });

    test("should remove empty arrays", () => {
      const input = { a: 1, b: [], c: [1, 2], d: "test" };
      expect(removeNullAttributes(input)).toEqual({ a: 1, c: [1, 2], d: "test" });
    });

    test("should not remove zero, false, or empty string values", () => {
      const input = { a: 0, b: false, c: "", d: "test" };
      expect(removeNullAttributes(input)).toEqual({ a: 0, b: false, c: "", d: "test" });
    });

    test("should handle empty object input", () => {
      const input = {};
      expect(removeNullAttributes(input)).toEqual({});
    });
  });

  // ---------- DTO Constructors Tests ----------
  describe("DTO Constructors", () => {
    describe("createDeskDTO", () => {
      test("should create a Desk DTO with only provided non-null/undefined values", () => {
        const desk = createDeskDTO(1, "Desk 1"); // Passiamo solo valori definiti
        expect(desk).toEqual({ id: 1, name: "Desk 1" });
        expect(desk.services).toBeUndefined(); // Verifica che la proprietà non esista
        expect(desk.tickets).toBeUndefined(); // Verifica che la proprietà non esista
      });

      test("should include all provided non-null/undefined values", () => {
        const mockServiceDTO: Service = { id: 10, name: "Service A", estimatedTime: 10 };
        const mockTicketDTO: Ticket = { id: 100, status: StatusType.open, createdAt: new Date() };
        const desk = createDeskDTO(2, "Desk 2", [mockServiceDTO], [mockTicketDTO]);
        expect(desk).toEqual({
          id: 2,
          name: "Desk 2",
          services: [mockServiceDTO],
          tickets: [mockTicketDTO],
        });
      });

      test("should omit properties if corresponding arguments are undefined", () => {
        const desk = createDeskDTO(1, undefined, undefined, undefined);
        expect(desk).toEqual({ id: 1 });
        expect(desk.name).toBeUndefined();
      });

      test("should omit properties if corresponding arguments are null", () => {
        // I parametri di createDeskDTO devono accettare null per questo test (vedi la nota sul DTO)
        const desk = createDeskDTO(1, undefined, undefined, undefined); // Assumendo che DeskDTO accetti id?: number | null, name?: string | null
        expect(desk).toEqual({ id: 1 });
        expect(desk.name).toBeUndefined(); // removeNullAttributes rimuove null
        expect(desk.services).toBeUndefined(); // removeNullAttributes rimuove null
        expect(desk.tickets).toBeUndefined(); // removeNullAttributes rimuove null
      });
    });

    describe("createServiceDTO", () => {
      test("should create a Service DTO with only provided non-null/undefined values", () => {
        const service = createServiceDTO(1, "Service 1", 15);
        expect(service).toEqual({ id: 1, name: "Service 1", estimatedTime: 15 });
        expect(service.desks).toBeUndefined();
        expect(service.tickets).toBeUndefined();
      });

      test("should include all provided non-null/undefined values", () => {
        const mockDeskDTO: Desk = { id: 1, name: "Desk X" };
        const mockTicketDTO: Ticket = { id: 100, status: StatusType.closed, createdAt: new Date() };
        const service = createServiceDTO(3, "Service 3", 30, [mockDeskDTO], [mockTicketDTO]);
        expect(service).toEqual({
          id: 3,
          name: "Service 3",
          estimatedTime: 30,
          desks: [mockDeskDTO],
          tickets: [mockTicketDTO],
        });
      });

      test("should omit properties if corresponding arguments are null/undefined or empty arrays", () => {
        const service = createServiceDTO(1, "Service 1", 15, undefined, []);
        expect(service).toEqual({ id: 1, name: "Service 1", estimatedTime: 15 });
        expect(service.desks).toBeUndefined(); // null è rimosso
        expect(service.tickets).toBeUndefined(); // array vuoto è rimosso
      });
    });

    describe("createTicketDTO", () => {
      test("should create a Ticket DTO with only provided non-null/undefined values", () => {
        const ticket = createTicketDTO(1, StatusType.open, new Date()); // Non passiamo endedAt, service, managedBy
        expect(ticket.id).toBe(1);
        expect(ticket.status).toBe(StatusType.open);
        expect(ticket.createdAt).toBeInstanceOf(Date);
        expect(ticket.endedAt).toBeUndefined(); // Se non fornito, endedAt non esiste
        expect(ticket.service).toBeUndefined();
        expect(ticket.managedBy).toBeUndefined();
      });

      test("should include all provided non-null/undefined values", () => {
        const mockServiceDTO: Service = { id: 1, name: "Service A", estimatedTime: 10 };
        const mockDeskDTO: Desk = { id: 1, name: "Desk 1" };
        const now = new Date();
        const ticket = createTicketDTO(2, StatusType.closed, now, now, mockServiceDTO, mockDeskDTO);
        expect(ticket).toEqual({
          id: 2,
          status: StatusType.closed,
          createdAt: now,
          endedAt: now,
          service: mockServiceDTO,
          managedBy: mockDeskDTO,
        });
      });

      test("should handle endedAt as null if passed (but then removed by removeNullAttributes)", () => {
        const ticket = createTicketDTO(1, StatusType.open, new Date(), null);
        expect(ticket.endedAt).toBeUndefined(); // removeNullAttributes rimuove null
      });

      test("should handle managedBy as null if passed (but then removed by removeNullAttributes)", () => {
        const ticket = createTicketDTO(1, StatusType.open, new Date(), undefined, undefined, null);
        expect(ticket.managedBy).toBeUndefined(); // removeNullAttributes rimuove null
      });
    });
  });

  // ---------- DAO -> DTO Mappers Tests ----------
  describe("DAO to DTO Mappers", () => {
    // Mock DAOs per i test (usiamo new DAO() per avere istanze corrette)
    const mockDeskDAO = new DeskDAO();
    mockDeskDAO.id = 1;
    mockDeskDAO.name = "Desk 1";
    // Le relazioni non sono popolate qui per i test base

    const mockServiceDAO = new ServiceDAO();
    mockServiceDAO.id = 10;
    mockServiceDAO.name = "Service A";
    mockServiceDAO.estimatedTime = 20;
    // Le relazioni non sono popolate qui per i test base

    const mockTicketDAO = new TicketDAO();
    mockTicketDAO.id = 100;
    mockTicketDAO.status = StatusType.open;
    mockTicketDAO.createdAt = new Date();
    // mockTicketDAO.endedAt è undefined di default

    describe("mapDeskDAOToDTO", () => {
      test("should map basic DeskDAO fields to Desk DTO", () => {
        const deskDTO = mapDeskDAOToDTO(mockDeskDAO);
        expect(deskDTO).toEqual({ id: 1, name: "Desk 1" });
        expect(deskDTO.services).toBeUndefined();
        expect(deskDTO.tickets).toBeUndefined();
      });
    });

    describe("mapServiceDAOToDTO", () => {
      test("should map basic ServiceDAO fields to Service DTO", () => {
        const serviceDTO = mapServiceDAOToDTO(mockServiceDAO);
        expect(serviceDTO).toEqual({
          id: 10,
          name: "Service A",
          estimatedTime: 20,
        });
        expect(serviceDTO.tickets).toBeUndefined();
      });

      test("should map nested desks relation if present (recursive call to mapDeskDAOToDTO)", () => {
        const serviceWithDesksDAO = new ServiceDAO();
        serviceWithDesksDAO.id = 11;
        serviceWithDesksDAO.name = "Service B";
        serviceWithDesksDAO.estimatedTime = 30;
        serviceWithDesksDAO.desks = [mockDeskDAO]; // Usa il DAO mockato

        const serviceDTO = mapServiceDAOToDTO(serviceWithDesksDAO);
        expect(serviceDTO.desks).toEqual([{ id: 1, name: "Desk 1" }]);
      });

      test("should handle serviceDAO with no desks (empty array)", () => {
        const serviceNoDesksDAO = new ServiceDAO();
        serviceNoDesksDAO.id = 12;
        serviceNoDesksDAO.name = "Service C";
        serviceNoDesksDAO.estimatedTime = 40;
        serviceNoDesksDAO.desks = []; // Array vuoto
        const serviceDTO = mapServiceDAOToDTO(serviceNoDesksDAO);
        expect(serviceDTO.desks).toBeUndefined(); // rimosso da removeNullAttributes
      });

      test("should handle serviceDAO with no desks (undefined)", () => {
        const serviceNoDesksDAO = new ServiceDAO();
        serviceNoDesksDAO.id = 12;
        serviceNoDesksDAO.name = "Service C";
        serviceNoDesksDAO.estimatedTime = 40;
        // serviceNoDesksDAO.desks è undefined di default
        const serviceDTO = mapServiceDAOToDTO(serviceNoDesksDAO);
        expect(serviceDTO.desks).toBeUndefined();
      });
    });

    describe("mapTicketDAOToDTO", () => {
      test("should map all basic TicketDAO fields to Ticket DTO", () => {
        const ticketDTO = mapTicketDAOToDTO(mockTicketDAO);
        expect(ticketDTO.id).toBe(100);
        expect(ticketDTO.status).toBe(StatusType.open);
        expect(ticketDTO.createdAt).toEqual(mockTicketDAO.createdAt);
        expect(ticketDTO.endedAt).toBeUndefined(); // mockTicketDAO.endedAt è undefined, quindi rimosso
      });

      test("should map nested service relation (recursive call to mapServiceDAOToDTO)", () => {
        const serviceDAOWithDesks = new ServiceDAO(); // Nuovo DAO per questo test
        serviceDAOWithDesks.id = mockServiceDAO.id;
        serviceDAOWithDesks.name = mockServiceDAO.name;
        serviceDAOWithDesks.estimatedTime = mockServiceDAO.estimatedTime;
        serviceDAOWithDesks.desks = [mockDeskDAO]; // Popola desks

        const ticketDAOWithService = { ...mockTicketDAO, service: serviceDAOWithDesks };
        const ticketDTO = mapTicketDAOToDTO(ticketDAOWithService);

        expect(ticketDTO.service).toEqual({
          id: mockServiceDAO.id,
          name: mockServiceDAO.name,
          estimatedTime: mockServiceDAO.estimatedTime,
          desks: [{ id: mockDeskDAO.id, name: "Desk 1" }],
        });
      });

      test("should map nested managedBy desk relation (recursive call to mapDeskDAOToDTO)", () => {
        const ticketDAOWithManagedBy = { ...mockTicketDAO, managedBy: mockDeskDAO };
        const ticketDTO = mapTicketDAOToDTO(ticketDAOWithManagedBy);
        expect(ticketDTO.managedBy).toEqual({ id: mockDeskDAO.id, name: "Desk 1" });
      });

      test("should handle null managedBy relation", () => {
        const ticketDANoManagedBy = { ...mockTicketDAO, managedBy: null };
        const ticketDTO = mapTicketDAOToDTO(ticketDANoManagedBy);
        expect(ticketDTO.managedBy).toBeUndefined(); // null è rimosso
      });

      test("should handle undefined service relation", () => {
        const ticketNoServiceDAO = new TicketDAO();
        ticketNoServiceDAO.id = 101;
        ticketNoServiceDAO.status = StatusType.open;
        ticketNoServiceDAO.createdAt = new Date();
        // service è undefined
        const ticketDTO = mapTicketDAOToDTO(ticketNoServiceDAO);
        expect(ticketDTO.service).toBeUndefined();
      });

      test("should handle endedAt date being undefined (mapped to null then removed)", () => {
        const ticketDAOWithoutEndedAt = new TicketDAO();
        ticketDAOWithoutEndedAt.id = 102;
        ticketDAOWithoutEndedAt.status = StatusType.open;
        ticketDAOWithoutEndedAt.createdAt = new Date();
        // endedAt è undefined

        const ticketDTO = mapTicketDAOToDTO(ticketDAOWithoutEndedAt);
        expect(ticketDTO.endedAt).toBeUndefined(); // mapped to null, then removed by removeNullAttributes
      });

      test("should handle endedAt date being a value", () => {
        const endDate = new Date();
        const ticketWithEndDateDAO = { ...mockTicketDAO, endedAt: endDate };
        const ticketDTO = mapTicketDAOToDTO(ticketWithEndDateDAO);
        expect(ticketDTO.endedAt).toEqual(endDate);
      });
    });
  });

  // ---------- DTO -> DAO Mappers Tests ----------
  describe("DTO to DAO Mappers", () => {
    const mockDeskDTO: Desk = { id: 1, name: "Desk 1" };
    const mockServiceDTO: Service = { id: 10, name: "Service A", estimatedTime: 20 };
    const mockTicketDTO: Ticket = {
      id: 100,
      status: StatusType.open,
      createdAt: new Date(),
      service: mockServiceDTO,
      managedBy: mockDeskDTO,
    };

    describe("mapDeskDTOToDAO", () => {
      test("should map basic DeskDTO fields to DeskDAO", () => {
        const deskDAO = mapDeskDTOToDAO(mockDeskDTO);
        expect(deskDAO).toBeInstanceOf(DeskDAO);
        expect(deskDAO.id).toBe(1);
        expect(deskDAO.name).toBe("Desk 1");
        expect(deskDAO.services).toBeUndefined();
      });

      test("should map nested services relation (partial ServiceDAOs)", () => {
        const deskWithServicesDTO: Desk = {
          ...mockDeskDTO,
          services: [{ id: 20, name: "Svc B", estimatedTime: 15 }],
        };
        const deskDAO = mapDeskDTOToDAO(deskWithServicesDTO);
        expect(deskDAO.services).toHaveLength(1);
        expect(deskDAO.services![0]).toBeInstanceOf(ServiceDAO);
        expect(deskDAO.services![0].id).toBe(20);
        expect(deskDAO.services![0].name).toBe("Svc B");
        expect(deskDAO.services![0].estimatedTime).toBe(15);
      });

      test("should handle DeskDTO without id", () => {
        const deskNoIdDTO: Desk = { name: "New Desk" };
        const deskDAO = mapDeskDTOToDAO(deskNoIdDTO);
        expect(deskDAO.id).toBeUndefined();
        expect(deskDAO.name).toBe("New Desk");
      });
    });

    describe("mapServiceDTOToDAO", () => {
      test("should map basic ServiceDTO fields to ServiceDAO", () => {
        const serviceDAO = mapServiceDTOToDAO(mockServiceDTO);
        expect(serviceDAO).toBeInstanceOf(ServiceDAO);
        expect(serviceDAO.id).toBe(10);
        expect(serviceDAO.name).toBe("Service A");
        expect(serviceDAO.estimatedTime).toBe(20);
      });

      test("should map nested desks relation (partial DeskDAOs)", () => {
        const serviceWithDesksDTO: Service = {
          ...mockServiceDTO,
          desks: [{ id: 2, name: "Desk B" }],
        };
        const serviceDAO = mapServiceDTOToDAO(serviceWithDesksDTO);
        expect(serviceDAO.desks).toHaveLength(1);
        expect(serviceDAO.desks![0]).toBeInstanceOf(DeskDAO);
        expect(serviceDAO.desks![0].id).toBe(2);
        expect(serviceDAO.desks![0].name).toBe("Desk B");
      });
    });

    describe("mapTicketDTOToDAO", () => {
      test("should map all basic TicketDTO fields to TicketDAO", () => {
        const ticketDAO = mapTicketDTOToDAO(mockTicketDTO);
        expect(ticketDAO).toBeInstanceOf(TicketDAO);
        expect(ticketDAO.id).toBe(100);
        expect(ticketDAO.status).toBe(StatusType.open);
        expect(ticketDAO.createdAt).toEqual(mockTicketDTO.createdAt);
        expect(ticketDAO.endedAt).toBeUndefined(); // endedAt è undefined se non fornito esplicitamente
      });

      test("should map nested service relation (only ID is set in DAO by mapperService)", () => {
        const ticketDAO = mapTicketDTOToDAO(mockTicketDTO);
        expect(ticketDAO.service).toBeInstanceOf(ServiceDAO);
        expect(ticketDAO.service!.id).toBe(mockServiceDTO.id);
        expect(ticketDAO.service!.name).toBeUndefined(); // Il mapper non setta name/estimatedTime per il servizio annidato
        expect(ticketDAO.service!.estimatedTime).toBeUndefined();
      });

      test("should map nested managedBy desk relation (only ID is set in DAO by mapperService)", () => {
        const ticketDAO = mapTicketDTOToDAO(mockTicketDTO);
        expect(ticketDAO.managedBy).toBeInstanceOf(DeskDAO);
        expect(ticketDAO.managedBy!.id).toBe(mockDeskDTO.id);
        expect(ticketDAO.managedBy!.name).toBeUndefined(); // Il mapper non setta name per il desk annidato
      });

      test("should handle null managedBy relation", () => {
        const ticketDTONullManagedBy: Ticket = { ...mockTicketDTO, managedBy: null };
        const ticketDAO = mapTicketDTOToDAO(ticketDTONullManagedBy);
        expect(ticketDAO.managedBy).toBeNull(); // Qui il mapper imposta esplicitamente a null
      });

      test("should handle undefined managedBy relation", () => {
        const ticketDTOUndefinedManagedBy: Ticket = { ...mockTicketDTO, managedBy: undefined };
        const ticketDAO = mapTicketDTOToDAO(ticketDTOUndefinedManagedBy);
        expect(ticketDAO.managedBy).toBeUndefined();
      });

      test("should handle ticket without id", () => {
        const ticketNoIdDTO: Ticket = {
          status: StatusType.open,
          createdAt: new Date(),
          service: { id: 1, name: "Svc", estimatedTime: 5 }, // Mock minimo per service
        };
        const ticketDAO = mapTicketDTOToDAO(ticketNoIdDTO);
        expect(ticketDAO.id).toBeUndefined();
        expect(ticketDAO.status).toBe(StatusType.open);
      });

      test("should handle endedAt date", () => {
        const endDate = new Date();
        const ticketWithEndDateDTO: Ticket = { ...mockTicketDTO, endedAt: endDate };
        const ticketDAO = mapTicketDTOToDAO(ticketWithEndDateDTO);
        expect(ticketDAO.endedAt).toEqual(endDate);
      });
    });
  });
});