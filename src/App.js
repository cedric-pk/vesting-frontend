// App.js

import { Button } from '@chakra-ui/button';
import { Box, Center, Container, Flex } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/spinner';
import { Tag } from '@chakra-ui/tag';
import React, { useEffect, useState } from 'react';

import { ethers } from 'ethers';

import { getVestingFactoryContract } from './contract';
import { abbreviateAddress } from './utils';
import VestingInterface from './VestingInterface';

import { FACTORY_CONTRACT_ADDRESS } from './config';

function App() {
  const metamask = window.ethereum;

  const [currentAccount, setCurrentAccount] = useState(
    metamask.selectedAddress
  );

  const [address, setAddress] = useState(null);

  const [currentSignerAddress, setCurrentSignerAddress] = useState(
    metamask.selectedAddress
  );

  metamask.on('accountsChanged', (accounts) => {
    setCurrentAccount(accounts[0]);
  });

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(metamask);

    const signer = provider.getSigner();

    signer.getAddress().then(setCurrentSignerAddress);

    const getAddress = async () => {
      const factoryContract = await getVestingFactoryContract(
        signer,
        FACTORY_CONTRACT_ADDRESS
      );

      const result = await factoryContract.getVestingAddress({
        from: metamask.selectedAddress,
      });

      setAddress(result);
    };
    getAddress();
  }, [currentAccount, metamask]);

  if (!metamask) return <Center>Metamask not installed!</Center>;

  return (
    <Container height="100vh">
      <Flex direction="column" height="100%" width="100%">
        <Center p={5}>
          <Box mr={2}>Your Wallet:</Box>

          {currentSignerAddress ? (
            <Tag colorScheme="teal">
              {abbreviateAddress(currentSignerAddress)}
            </Tag>
          ) : (
            <Button
              colorScheme="blue"
              onClick={() =>
                metamask.request({ method: 'eth_requestAccounts' })
              }
            >
              Connect Metamask
            </Button>
          )}
        </Center>

        {!address ? (
          <Center flexGrow={1}>
            <Spinner size="xl" color="teal.500" />
          </Center>
        ) : address === '0x0000000000000000000000000000000000000000' ? (
          'Your address does not have a vesting contract! Please make sure your network and metamask address are correct.'
        ) : (
          <Flex flexGrow={1}>
            <VestingInterface vestingContractAddress={address} />
          </Flex>
        )}
      </Flex>
    </Container>
  );
}

// Wrap everything in <UseWalletProvider />
export default App;
