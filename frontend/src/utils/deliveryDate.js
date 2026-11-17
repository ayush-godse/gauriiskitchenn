export const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};
