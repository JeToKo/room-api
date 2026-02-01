const getDate = (hoursFromNow: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    return date;
};

export default getDate;