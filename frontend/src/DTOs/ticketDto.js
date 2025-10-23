export class TicketDto {
  constructor({ id, Status, TimeStarted, TimeEnded }) {
    this.id = id;
    this.Status = Status;
    this.TimeStarted = TimeStarted;
    this.TimeEnded = TimeEnded;
  }
}
