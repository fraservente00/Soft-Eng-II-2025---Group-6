import QueueService from "../../../services/queueService";
import { ServiceRepository } from "../../../repositories/ServiceRepository";
import { TicketRepository } from "../../../repositories/TicketRepository";
import { StatusType } from "../../../models/StatusType";
import { ServiceDAO } from "../../../models/DAO/ServiceDAO";
import { TicketDAO } from "../../../models/DAO/TicketDAO";

describe("QueueService", () => {
  beforeEach(() => {
    // reset stato del singleton
    (QueueService as any).queues = new Map();
    (QueueService as any).initialized = false;
    // reset degli spy/mocks
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("inizializza le code dai ticket aperti esistenti (ordinati per id asc)", async () => {
      const services: ServiceDAO[] = [
        { id: 1, name: "Service A", estimatedTime: 10 } as ServiceDAO,
        { id: 2, name: "Service B", estimatedTime: 15 } as ServiceDAO,
      ];
      const s1Tickets: TicketDAO[] = [
        { id: 103, service: { id: 1 } as any } as TicketDAO,
        { id: 101, service: { id: 1 } as any } as TicketDAO,
        { id: 102, service: { id: 1 } as any } as TicketDAO,
      ];
      const s2Tickets: TicketDAO[] = [{ id: 201, service: { id: 2 } as any } as TicketDAO];

      const findAllSpy = jest
        .spyOn(ServiceRepository.prototype, "findAll")
        .mockResolvedValue(services);

      const findByServiceIdStatusSpy = jest
        .spyOn(TicketRepository.prototype, "findByServiceIdStatus")
        .mockImplementation(async (serviceId: number, _status: StatusType) => {
          if (serviceId === 1) return s1Tickets;
          if (serviceId === 2) return s2Tickets;
          return [];
        });

      await QueueService.init();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(findByServiceIdStatusSpy).toHaveBeenCalledWith(1, StatusType.open as any);
      expect(findByServiceIdStatusSpy).toHaveBeenCalledWith(2, StatusType.open as any);

      // deve ordinare gli id
      expect(QueueService.dump()).toEqual({
        "1": [101, 102, 103],
        "2": [201],
      });
      expect((QueueService as any).initialized).toBe(true);
    });

    it("non reinizializza se già inizializzato", async () => {
      (QueueService as any).initialized = true;
      const findAllSpy = jest
        .spyOn(ServiceRepository.prototype, "findAll")
        .mockResolvedValue([]);

      await QueueService.init();

      expect(findAllSpy).not.toHaveBeenCalled();
    });

    it("propaga errore se findAll fallisce", async () => {
      jest
        .spyOn(ServiceRepository.prototype, "findAll")
        .mockRejectedValue(new Error("DB Error"));

      await expect(QueueService.init()).rejects.toThrow("DB Error");
      expect((QueueService as any).initialized).toBe(false);
    });

    it("gestisce errori di findByServiceIdStatus per servizio impostando la coda vuota", async () => {
      const services: ServiceDAO[] = [
        { id: 1, name: "Service A", estimatedTime: 10 } as ServiceDAO,
      ];
      jest
        .spyOn(ServiceRepository.prototype, "findAll")
        .mockResolvedValue(services);
      jest
        .spyOn(TicketRepository.prototype, "findByServiceIdStatus")
        .mockRejectedValue(new Error("Ticket DB Error"));

      await QueueService.init();

      expect(QueueService.dump()).toEqual({ "1": [] });
      expect((QueueService as any).initialized).toBe(true);
    });
  });

  describe("ensureQueue", () => {
    it("crea una coda vuota se non esiste", () => {
      expect(QueueService.dump()).toEqual({});
      QueueService.ensureQueue(1);
      expect(QueueService.dump()).toEqual({ "1": [] });
    });

    it("non modifica la coda se già esiste", () => {
      (QueueService as any).queues.set(1, [101]);
      QueueService.ensureQueue(1);
      expect(QueueService.dump()).toEqual({ "1": [101] });
    });
  });

  describe("enqueue", () => {
    it("aggiunge il ticket in fondo alla coda corretta", () => {
      (QueueService as any).queues.set(1, [101, 102]);
      const ticket = { id: 301, service: { id: 1 } } as TicketDAO;

      QueueService.enqueue(ticket);

      expect(QueueService.dump()).toEqual({ "1": [101, 102, 301] });
    });

    it("crea la coda se non esiste", () => {
      const ticket = { id: 301, service: { id: 2 } } as TicketDAO;

      QueueService.enqueue(ticket);

      expect(QueueService.dump()).toEqual({ "2": [301] });
    });

    it("non fa nulla se manca il serviceId", () => {
      (QueueService as any).queues.set(1, [101]);
      QueueService.enqueue({ id: 301 } as any);
      QueueService.enqueue(null as any);

      expect(QueueService.dump()).toEqual({ "1": [101] });
    });
  });

  describe("dequeue", () => {
    it("rimuove e ritorna il primo ticket della coda", async () => {
      (QueueService as any).queues.set(1, [101, 102]);
      const ticket = { id: 101, service: { id: 1 } } as TicketDAO;

      const findByIdSpy = jest
        .spyOn(TicketRepository.prototype, "findById")
        .mockResolvedValue(ticket);

      const res = await QueueService.dequeue(1);

      expect(res).toEqual(ticket);
      expect(QueueService.dump()).toEqual({ "1": [102] });
      expect(findByIdSpy).toHaveBeenCalledWith(101);
    });

    it("ritorna null se la coda è vuota (senza chiamare il repo)", async () => {
      (QueueService as any).queues.set(1, []);

      const findByIdSpy = jest
        .spyOn(TicketRepository.prototype, "findById")
        .mockResolvedValue(null);

      const res = await QueueService.dequeue(1);

      expect(res).toBeNull();
      expect(QueueService.dump()).toEqual({ "1": [] });
      expect(findByIdSpy).not.toHaveBeenCalled();
    });

    it("ritorna null se findById ritorna null, rimuovendo comunque l'id dalla coda", async () => {
      (QueueService as any).queues.set(1, [101]);

      jest
        .spyOn(TicketRepository.prototype, "findById")
        .mockResolvedValue(null);

      const res = await QueueService.dequeue(1);

      expect(res).toBeNull();
      expect(QueueService.dump()).toEqual({ "1": [] });
    });
  });

  describe("getQueueLength", () => {
    it("ritorna la lunghezza corretta", () => {
      (QueueService as any).queues.set(1, [101, 102, 103]);
      expect(QueueService.getQueueLength(1)).toBe(3);
    });

    it("ritorna 0 se la coda non esiste e la crea", () => {
      expect(QueueService.getQueueLength(2)).toBe(0);
      expect(QueueService.dump()).toEqual({ "2": [] });
    });
  });

  describe("dump", () => {
    it("ritorna una copia plain object delle code", () => {
      (QueueService as any).queues.set(1, [101, 102]);
      (QueueService as any).queues.set(2, [201]);

      const dumped = QueueService.dump();

      expect(dumped).toEqual({ "1": [101, 102], "2": [201] });

      // verifica che sia copia (mutare l'originale non cambia dumped)
      (QueueService as any).queues.get(1)!.push(103);
      expect(dumped).toEqual({ "1": [101, 102], "2": [201] });
    });
  });

  describe("getQueuePerId", () => {
    it("ritorna l'array della coda per serviceId (stesso riferimento)", () => {
      const arr = [101, 102];
      (QueueService as any).queues.set(1, arr);

      const returned = QueueService.getQueuePerId(1);
      expect(returned).toBe(arr); // stesso array
      returned.push(103);
      expect((QueueService as any).queues.get(1)).toEqual([101, 102, 103]);
    });

    it("crea e ritorna una nuova coda vuota se non esiste", () => {
      const returned = QueueService.getQueuePerId(2);
      expect(returned).toEqual([]);
      expect(QueueService.dump()).toEqual({ "2": [] });
    });
  });
});