export const DEFAULT_PRICES = {
  electricity: 3500,
  water: 12000,
  room: 2100000,
  extraPerson: 200000,
  aircon: 300000,
  trashWifi: 60000
};

export const mergePrices = (raw = {}) => ({
  ...DEFAULT_PRICES,
  ...raw
});

export const calculateRoomPrice = ({ guestCount = 1, hasAircon = false, prices = DEFAULT_PRICES } = {}) => {
  const guests = Math.max(1, Number(guestCount) || 1);
  const base = Number(prices.room) || 0;
  const extra = Number(prices.extraPerson) || 0;
  const airconFee = Number(prices.aircon) || 0;
  return base + extra * Math.max(0, guests - 1) + (hasAircon ? airconFee : 0);
};
