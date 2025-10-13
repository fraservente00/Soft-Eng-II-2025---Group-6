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
} from "../../../services/mapperService";
import { DeskDAO } from "../../../models/DAO/DeskDAO";
import { ServiceDAO } from "../../../models/DAO/ServiceDAO";
import { TicketDAO } from "../../../models/DAO/TicketDAO";
import { StatusType } from "../../../models/StatusType";

// Mock semplici per i DTO per evitare dipendenze circolari nei test,
// anche se nel tuo caso sono interfacce TypeScript pure, quindi non servono istanze concrete
// ma le useremo per i tipi e i valori di esempio.
type DeskDTO = { id?: number; name: string; services?: any[]; tickets?: any[] };
type ServiceDTO = { id?: number; name: string; estimatedTime: number; desks?: any[]; tickets?: any[] };
type TicketDTO = {
    id?: number;
    status?: StatusType;
    createdAt?: Date;
    endedAt?: Date | null;
    service?: ServiceDTO;
    managedBy?: DeskDTO | null;
};

// Funzione helper locale per il test di removeNullAttributes
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
    // ---------- removeNullAttributes Helper Function ----------
    describe("removeNullAttributes", () => {
        test("should remove null and undefined attributes", () => {
            const input = { a: 1, b: null, c: undefined, d: "test" };
            expect(removeNullAttributes(input)).toEqual({ a: 1, d: "test" });
        });

        test("should remove empty arrays", () => {
            const input = { a: 1, b: [], c: [1, 2], d: "test" };
            expect(removeNullAttributes(input)).toEqual({ a: 1, c: [1, 2], d: "test" });
        });

        test("should not remove zero or false values", () => {
            const input = { a: 0, b: false, c: "", d: "test" };
            expect(removeNullAttributes(input)).toEqual({ a: 0, b: false, c: "", d: "test" });
        });

        test("should handle nested objects (not removed unless they are null/undefined themselves)", () => {
            const input = { a: { x: 1, y: null }, b: null };
            expect(removeNullAttributes(input)).toEqual({ a: { x: 1, y: null } }); // removeNullAttributes è shallow
        });
    });

    // ---------- DTO Constructors ----------
    describe("DTO Constructors", () => {
        test("createDeskDTO should create a Desk DTO without null/undefined values", () => {
            const desk = createDeskDTO(1, "Desk 1", [], undefined);
            expect(desk).toEqual({ id: 1, name: "Desk 1" });
            expect(desk.services).toBeUndefined();
            expect(desk.tickets).toBeUndefined();
        });

        test("createDeskDTO should include all provided values", () => {
            const serviceDTO: ServiceDTO = { name: "Service A", estimatedTime: 10 };
            const ticketDTO: TicketDTO = { status: "open", createdAt: new Date() };
            const desk = createDeskDTO(2, "Desk 2", [serviceDTO], [ticketDTO]);
            expect(desk).toEqual({ id: 2, name: "Desk 2", services: [serviceDTO], tickets: [ticketDTO] });
        });

        test("createServiceDTO should create a Service DTO without null/undefined values", () => {
            const service = createServiceDTO(1, "Service 1", 15, undefined, []);
            expect(service).toEqual({ id: 1, name: "Service 1", estimatedTime: 15 });
            expect(service.desks).toBeUndefined();
            expect(service.tickets).toBeUndefined();
        });

        test("createServiceDTO should include all provided values", () => {
            const deskDTO: DeskDTO = { name: "Desk X" };
            const ticketDTO: TicketDTO = { status: "closed", createdAt: new Date() };
            const service = createServiceDTO(3, "Service 3", 30, [deskDTO], [ticketDTO]);
            expect(service).toEqual({ id: 3, name: "Service 3", estimatedTime: 30, desks: [deskDTO], tickets: [ticketDTO] });
        });

        test("createTicketDTO should create a Ticket DTO without null/undefined values", () => {
            const ticket = createTicketDTO(1, "open" as StatusType, new Date(), null, undefined, undefined);
            expect(ticket.id).toBe(1);
            expect(ticket.status).toBe("open");
            expect(ticket.createdAt).toBeInstanceOf(Date);
            expect(ticket.endedAt).toBeUndefined(); 
            expect(ticket.service).toBeUndefined();
            expect(ticket.managedBy).toBeUndefined();
        });

        test("createTicketDTO should include all provided values", () => {
            const serviceDTO: ServiceDTO = { id: 1, name: "Service A", estimatedTime: 10 };
            const deskDTO: DeskDTO = { id: 1, name: "Desk 1" };
            const now = new Date();
            const ticket = createTicketDTO(2, "closed" as StatusType, now, now, serviceDTO, deskDTO);
            expect(ticket).toEqual({
                id: 2,
                status: "closed",
                createdAt: now,
                endedAt: now,
                service: serviceDTO,
                managedBy: deskDTO,
            });
        });
    });

    // ---------- DAO -> DTO Mappers ----------
    describe("DAO to DTO Mappers", () => {
        // Mock DAOs per i test
        const mockDeskDAO = new DeskDAO();
        mockDeskDAO.id = 1;
        mockDeskDAO.name = "Desk 1";
        mockDeskDAO.services = [];
        mockDeskDAO.tickets = [];

        const mockServiceDAO = new ServiceDAO();
        mockServiceDAO.id = 10;
        mockServiceDAO.name = "Service A";
        mockServiceDAO.estimatedTime = 20;
        mockServiceDAO.desks = [mockDeskDAO];
        mockServiceDAO.tickets = [];

        const mockTicketDAO = new TicketDAO();
        mockTicketDAO.id = 100;
        mockTicketDAO.status = StatusType.open;
        mockTicketDAO.createdAt = new Date();
        mockTicketDAO.endedAt = null;
        mockTicketDAO.service = mockServiceDAO;
        mockTicketDAO.managedBy = mockDeskDAO;


        describe("mapDeskDAOToDTO", () => {
            test("should map basic DeskDAO fields to Desk DTO", () => {
                const deskDTO = mapDeskDAOToDTO(mockDeskDAO);
                expect(deskDTO).toEqual({ id: 1, name: "Desk 1" });
                expect(deskDTO.services).toBeUndefined(); // Relazioni omesse intenzionalmente
                expect(deskDTO.tickets).toBeUndefined(); // Relazioni omesse intenzionalmente
            });
        });

        describe("mapServiceDAOToDTO", () => {
            test("should map basic ServiceDAO fields to Service DTO", () => {
                const serviceDTO = mapServiceDAOToDTO(mockServiceDAO);
                expect(serviceDTO.id).toBe(10);
                expect(serviceDTO.name).toBe("Service A");
                expect(serviceDTO.estimatedTime).toBe(20);
                expect(serviceDTO.tickets).toBeUndefined(); // Omesse intenzionalmente
            });

            test("should map nested desks relation if present", () => {
                const serviceWithDesksDAO = new ServiceDAO();
                serviceWithDesksDAO.id = 11;
                serviceWithDesksDAO.name = "Service B";
                serviceWithDesksDAO.estimatedTime = 30;
                serviceWithDesksDAO.desks = [mockDeskDAO];

                const serviceDTO = mapServiceDAOToDTO(serviceWithDesksDAO);
                expect(serviceDTO.desks).toEqual([{ id: 1, name: "Desk 1" }]);
            });

            test("should handle serviceDAO with no desks", () => {
                const serviceNoDesksDAO = new ServiceDAO();
                serviceNoDesksDAO.id = 12;
                serviceNoDesksDAO.name = "Service C";
                serviceNoDesksDAO.estimatedTime = 40;
                serviceNoDesksDAO.desks = []; // Array vuoto

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
                expect(ticketDTO.endedAt).toBeUndefined();
            });

            test("should map nested service relation", () => {
                const ticketDTO = mapTicketDAOToDTO(mockTicketDAO);
                expect(ticketDTO.service).toEqual({
                    id: mockServiceDAO.id,
                    name: mockServiceDAO.name,
                    estimatedTime: mockServiceDAO.estimatedTime,
                    desks: [{ id: mockDeskDAO.id, name: mockDeskDAO.name }]
                });
            });

            test("should map nested managedBy desk relation", () => {
                const ticketDTO = mapTicketDAOToDTO(mockTicketDAO);
                expect(ticketDTO.managedBy).toEqual({ id: mockDeskDAO.id, name: mockDeskDAO.name });
            });

            test("should handle null managedBy relation", () => {
                const ticketDANoDesk = { ...mockTicketDAO, managedBy: null };
                const ticketDTO = mapTicketDAOToDTO(ticketDANoDesk);
                expect(ticketDTO.managedBy).toBeUndefined();
            });

            test("should handle undefined service relation", () => {
        // Creiamo una nuova istanza di TicketDAO e la prepariamo per il test
        const ticketNoServiceDAO = new TicketDAO();
        ticketNoServiceDAO.id = 101; // Un id diverso per chiarezza
        ticketNoServiceDAO.status = StatusType.open;
        ticketNoServiceDAO.createdAt = new Date();
        ticketNoServiceDAO.endedAt = null;
        // deliberatey leave ticketNoServiceDAO.service as undefined (default for new instance)
        ticketNoServiceDAO.managedBy = null; // o un mock DeskDAO se serve

        const ticketDTO = mapTicketDAOToDTO(ticketNoServiceDAO);
        expect(ticketDTO.service).toBeUndefined();
      });

            test("should handle endedAt date", () => {
                const endDate = new Date();
                const ticketWithEndDateDAO = { ...mockTicketDAO, endedAt: endDate };
                const ticketDTO = mapTicketDAOToDTO(ticketWithEndDateDAO);
                expect(ticketDTO.endedAt).toEqual(endDate);
            });
        });
    });

    // ---------- DTO -> DAO Mappers ----------
    describe("DTO to DAO Mappers", () => {
        const mockDeskDTO: DeskDTO = { id: 1, name: "Desk 1" };
        const mockServiceDTO: ServiceDTO = { id: 10, name: "Service A", estimatedTime: 20 };
        const mockTicketDTO: TicketDTO = {
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
                expect(deskDAO.services).toBeUndefined(); // Le relazioni DAO devono essere assegnate esplicitamente se fornite
            });

            test("should map nested services relation", () => {
                const deskWithServicesDTO: DeskDTO = {
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
                const deskNoIdDTO: DeskDTO = { name: "New Desk" };
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

            test("should map nested desks relation", () => {
                const serviceWithDesksDTO: ServiceDTO = {
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
                expect(ticketDAO.endedAt).toBeUndefined(); // endedAt è undefined se non fornito nel DTO, non null
            });

            test("should map nested service relation (minimal)", () => {
                const ticketDAO = mapTicketDTOToDAO(mockTicketDTO);
                expect(ticketDAO.service).toBeInstanceOf(ServiceDAO);
                expect(ticketDAO.service.id).toBe(mockServiceDTO.id);
                expect(ticketDAO.service.name).toBe(mockServiceDTO.name);
                expect(ticketDAO.service.estimatedTime).toBe(mockServiceDTO.estimatedTime);
            });

            test("should map nested managedBy desk relation (minimal)", () => {
                const ticketDAO = mapTicketDTOToDAO(mockTicketDTO);
                expect(ticketDAO.managedBy).toBeInstanceOf(DeskDAO);
                expect(ticketDAO.managedBy!.id).toBe(mockDeskDTO.id);
                expect(ticketDAO.managedBy!.name).toBe(mockDeskDTO.name);
            });

            test("should handle null managedBy relation", () => {
                const ticketDTONullManagedBy: TicketDTO = { ...mockTicketDTO, managedBy: null };
                const ticketDAO = mapTicketDTOToDAO(ticketDTONullManagedBy);
                expect(ticketDAO.managedBy).toBeNull();
            });

            test("should handle undefined managedBy relation", () => {
                const ticketDTOUndefinedManagedBy: TicketDTO = { ...mockTicketDTO, managedBy: undefined };
                const ticketDAO = mapTicketDTOToDAO(ticketDTOUndefinedManagedBy);
                expect(ticketDAO.managedBy).toBeUndefined(); // O null, dipende dal TypeORM default
            });

            test("should handle ticket without id", () => {
                const ticketNoIdDTO: TicketDTO = {
                    status: StatusType.open,
                    createdAt: new Date(),
                    service: { name: "Svc", estimatedTime: 5 },
                };
                const ticketDAO = mapTicketDTOToDAO(ticketNoIdDTO);
                expect(ticketDAO.id).toBeUndefined();
                expect(ticketDAO.status).toBe(StatusType.open);
            });

            test("should handle endedAt date", () => {
                const endDate = new Date();
                const ticketWithEndDateDTO: TicketDTO = { ...mockTicketDTO, endedAt: endDate };
                const ticketDAO = mapTicketDTOToDAO(ticketWithEndDateDTO);
                expect(ticketDAO.endedAt).toEqual(endDate);
            });
        });
    });
});