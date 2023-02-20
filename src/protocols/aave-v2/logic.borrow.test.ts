import { AaveV2BorrowLogic } from './logic.borrow';
import { InterestRateMode } from './types';
import { SpenderAaveV2Delegation__factory } from './contracts';
import { constants, utils } from 'ethers';
import * as core from 'src/core';
import { expect } from 'chai';
import { getContractAddress } from './config';
import { mainnet } from './tokens/data';

describe('AaveV2BorrowLogic', function () {
  const chainId = core.network.ChainId.mainnet;
  const aavev2BorrowLogic = new AaveV2BorrowLogic({ chainId });

  context('Test getLogic', function () {
    const spenderAaveV2Delegation = SpenderAaveV2Delegation__factory.createInterface();

    const cases = [
      {
        output: new core.tokens.TokenAmount(mainnet.WETH, '1'),
        interestRateMode: InterestRateMode.variable,
      },
      {
        output: new core.tokens.TokenAmount(mainnet.USDC, '1'),
        interestRateMode: InterestRateMode.variable,
      },
    ];

    cases.forEach(({ output, interestRateMode }) => {
      it(`borrow ${output.token.symbol}`, async function () {
        const logic = await aavev2BorrowLogic.getLogic({ output, interestRateMode });
        const sig = logic.data.substring(0, 10);

        expect(utils.isBytesLike(logic.data)).to.be.true;
        expect(logic.to).to.eq(getContractAddress(chainId, 'SpenderAaveV2Delegation'));
        if (output.token.isNative()) {
          expect(sig).to.eq(spenderAaveV2Delegation.getSighash('borrowETH'));
        } else {
          expect(sig).to.eq(spenderAaveV2Delegation.getSighash('borrow'));
        }
        expect(logic.inputs).to.deep.eq([]);
        expect(logic.outputs).to.deep.eq([]);
        expect(logic.approveTo).to.eq(constants.AddressZero);
        expect(logic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});
