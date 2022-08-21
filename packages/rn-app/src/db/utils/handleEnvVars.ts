import {
  MAINNET,
  MAINNET__CONTRACT_ADDRESS,
  MAINNET__CREATE_POST_COST_APPROX,
  MAINNET__RPC_FULL_URL,
  MAINNET__VOTE_COST_APPROX,
  TESTNET__CONTRACT_ADDRESS,
  TESTNET__CREATE_POST_COST_APPROX,
  TESTNET__RPC_FULL_URL,
  TESTNET__VOTE_COST_APPROX,
} from 'react-native-dotenv';

export const VOTE_COST_APPROX =
  MAINNET === 'true' ? MAINNET__VOTE_COST_APPROX : TESTNET__VOTE_COST_APPROX;

export const CREATE_POST_COST_APPROX =
  MAINNET === 'true'
    ? MAINNET__CREATE_POST_COST_APPROX
    : TESTNET__CREATE_POST_COST_APPROX;

export const RPC_FULL_URL =
  MAINNET === 'true' ? MAINNET__RPC_FULL_URL : TESTNET__RPC_FULL_URL;

export const CONTRACT_ADDRESS =
  MAINNET === 'true' ? MAINNET__CONTRACT_ADDRESS : TESTNET__CONTRACT_ADDRESS;
