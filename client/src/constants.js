export const CATEGORIES = {
    clothes: "Ένδυση",
    office_supplies: "Είδη Γραφείου",
    accessories: "Αξεσουάρ"
};
export function money(amount) {
    return Number(amount || 0).toLocaleString("el-GR", { style: "currency", currency: "EUR" });
}
