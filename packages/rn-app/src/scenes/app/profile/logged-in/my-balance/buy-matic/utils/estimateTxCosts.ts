import {ESTIMATE_COST_ENDPOINT, handleError} from '_db';

import {getAkashNodeEndpoint} from './getEndpoint';

export const estimateTxCosts = async (): Promise<{
  estimatedTxCosts: any;
  error?: string;
}> => {
  try {
    const response = await fetch(
      (await getAkashNodeEndpoint()) + ESTIMATE_COST_ENDPOINT,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        // TODO: send password as a query param
      },
    );

    const json = await response.json();

    if (!json.error && !json.errorString) {
      return {estimatedTxCosts: json};
    } else {
      return {error: json.errorString, estimatedTxCosts: undefined};
    }
  } catch (error) {
    console.error('estimateTxCosts - catch', error);

    return {estimatedTxCosts: undefined, ...handleError(error)};
  }
};
