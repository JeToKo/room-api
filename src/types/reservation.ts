interface Reservation {
    id: string | undefined | null;
    roomId: string | undefined | null;
    startTime: Date;
    endTime: Date;
}

export default Reservation;