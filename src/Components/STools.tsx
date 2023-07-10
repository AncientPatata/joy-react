import React from "react";

import Draggable from "react-draggable";

import { Box, Button, Flex, Text } from "@chakra-ui/react";

const toolNames = { timer: STimer, coin: SCoin, dice: SDice };

function SToolsContainer(props: any) {
  const { tools, ...otherProps } = props;
  let x = 10;
  let y = 6;
  let children = [];
  console.log(tools);
  if (Object.keys(tools).length > 0) {
    for (const [key, value] of Object.entries(tools)) {
      // @ts-ignore
      let elem = // @ts-ignore
        React.createElement(toolNames[key], {
          posx: x,
          posy: y,
          // @ts-ignore
          ...value,
        });
      children.push(elem);
      x += 100;
    }
  }
  return <Box>{...children}</Box>;
}

// TODO : consider adding weighted/cheated params that force high prob a certain roll or coin flip
function SDice(props: any) {
  const { posx, posy, ...otherProps } = props;
  const [roll, setRoll] = React.useState("...");

  const rollDice = () => {
    // Number between 1 and 6
    const newRoll = Math.floor(Math.random() * 6) + 1;
    //@ts-ignore
    setRoll(newRoll);
  };

  return (
    <Draggable>
      <Box
        position="absolute"
        top={posx}
        left={posy}
        width="max-content"
        bgColor="orange.400"
      >
        <Text padding="8px">{`Roll: ${roll}`}</Text>
        <Button rounded="none" w="100%" h="20px" onClick={rollDice}>
          Roll Dice
        </Button>
      </Box>
    </Draggable>
  );
}

function SCoin(props: any) {
  const { posx, posy, ...otherProps } = props;
  const [flip, setFlip] = React.useState("...");

  const flipCoin = () => {
    // Random boolean
    const newFlip = Math.random() > 0.5 ? "Heads" : "Tails";
    setFlip(newFlip);
  };

  return (
    <Draggable>
      <Box
        position="absolute"
        top={posx}
        left={posy}
        width="max-content"
        bgColor="green.400"
      >
        <Text padding="8px">{`Flip: ${flip}`}</Text>
        <Button rounded="none" w="100%" h="20px" onClick={flipCoin}>
          Flip Coin
        </Button>
      </Box>
    </Draggable>
  );
}

function STimer(props: any) {
  const { posx, posy, dur: duration, ...otherProps } = props;
  const [seconds, setSeconds] = React.useState(duration ? duration : 5);
  const [isActive, setIsActive] = React.useState(false);

  const handleClick = () => {
    if (seconds === (duration ? duration : 5)) {
      setIsActive(!isActive);
    } else {
      resetTimer();
    }
  };

  const resetTimer = () => {
    setSeconds(duration ? duration : 5);
    setIsActive(false);
  };

  React.useEffect(() => {
    // @ts-ignore
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        // @ts-ignore
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      // @ts-ignore
      clearInterval(interval);
    }

    return () => {
      // @ts-ignore
      clearInterval(interval);
    };
  }, [isActive, seconds]);
  return (
    <Draggable>
      <Box
        position="absolute"
        top={posx}
        left={posy}
        width="max-content"
        bgColor="pink.400"
      >
        <Flex flexDir="column" width="100%" h="100%">
          <Text padding="8px">{seconds} seconds</Text>
          <Button rounded="none" w="100%" h="20px" onClick={handleClick}>
            {isActive ? "Reset" : "Start"}
          </Button>
        </Flex>
      </Box>
    </Draggable>
  );
}

export default SToolsContainer;
