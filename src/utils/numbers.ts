import numbro from "numbro";
import { ethers } from "ethers";
// using a currency library here in case we want to add more in future
export const formatDollarAmount = (
  num: number | undefined,
  digits = 2,
  round = true
) => {
  if (num === 0) return "$0.00";
  if (!num) return "-";
  if (num < 0.001 && digits <= 3) {
    return "<$0.001";
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: "M",
      billion: "B",
    },
  });
};

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2) => {
  if (num === 0) return "0";
  if (!num) return "-";
  if (num < 0.001) {
    return "<0.001";
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: "M",
      billion: "B",
    },
  });
};

export const ConvertEthTonormal = async (amount: string,dl:number) => {
  const _amount = await ethers.utils.formatUnits(amount, dl);
  return _amount;
};



export function formatNumber(number:number) {
  if (number === null || number === undefined) {
    return '0';
  } else if (number < 1000) {
    const formattedNumber = number.toFixed(2);
    return formattedNumber.toString();
  } else if (number >= 1000 && number < 1000000) {
    const formattedNumber = (number / 1000).toFixed(1);
    return `${formattedNumber}K`;
  } else if (number >= 1000000 && number < 1000000000) {
    const formattedNumber = (number / 1000000).toFixed(1);
    return `${formattedNumber}M`;
  } else {
    const formattedNumber = (number / 1000000000).toFixed(1);
    return `${formattedNumber}B`;
  }
}
export const truncateAddress = (address: string) => {
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(truncateRegex);
  if (!match) {
    return address;
  }
  return `${match[1]}…${match[2]}`;
};

export const hexToInt = (s: any) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(bn.toString());
};

export function calculatePercentage(
  total: string,
  Amount: string
) {
  if (Number(total) <= 0) {
    return 100;
  }

  const stakingPercentage = (Number(Amount) / Number(total)) * 100;

  // Cap the staking percentage at 100%
  const cappedPercentage = Math.min(stakingPercentage, 100);

  return Math.round(cappedPercentage * 100) / 100;
}





export function calculateRewardPercentage(
  principal: number,
  reward: number,
  emergencyEndDay: number,
  stakeDays: number
): number {
  const hasServed50Percent = emergencyEndDay >= stakeDays / 2;
  const percentage = hasServed50Percent ? (reward / principal) * 100 : 0;
  return Math.min(percentage, 100);

}


export function calculateHexReceivedFromPenalty(
  principal: number,
  stakeDays: number,
  emergencyEndDay: number,
  interest: number
): {
  percentagenotServed: number;
  totalPenalty: number;
  totalPantlypercent: number;
  percentageOfrewardPantly: number;
  rewardPantly: number;
} {
  // Check if at least 50% of stake duration has been served
  const hasServed50Percent = emergencyEndDay >= stakeDays / 2;
  const halfofday = stakeDays / 2;
  const percentagenotServed = hasServed50Percent
    ? 100
    : 100 - (emergencyEndDay / halfofday) * 100;
  const penalty = hasServed50Percent
    ? 0
    : (percentagenotServed / 100) * principal + interest;
  const totalPantlypercent = (penalty / principal) * 100;
  const percentageOfrewardPantly = ((penalty - interest) / principal) * 100;

  const rewardPantly = hasServed50Percent ? 0 : interest;

  return {
    percentagenotServed,
    totalPenalty: penalty,
    totalPantlypercent:Math.min(totalPantlypercent, 100),
    percentageOfrewardPantly :Math.min(percentageOfrewardPantly, 100),
    rewardPantly,
  };
}

export function calculateEnddayPenalty(
  principal: number,
  totalStakeDays: number,
  emergencyEndDay: number
): number {
  const extraday = emergencyEndDay - totalStakeDays;
  const gracePeriodDays = 14;
  const weeklyPenaltyRate = 0.01;
  const daysBeyondGracePeriod = Math.max(0, extraday - gracePeriodDays);

  // Calculate the number of weeks passed after the grace period
  const weeksPassed = Math.floor(daysBeyondGracePeriod / 7);

  // Calculate the total penalty based on the number of weeks passed
  const totalPenalty = principal * weeklyPenaltyRate * weeksPassed;

  return totalPenalty;
}
