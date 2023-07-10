import { join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Box,
  Text,
  Image,
  Button,
  Flex,
  VStack,
  Center,
  Grid,
  GridItem,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Countdown from "react-countdown";
import {
  DialogueDisplay,
  BottomBar,
  DialogueBox,
  ChoiceBox,
} from "../Components/Narra";
import SToolsContainer from "../Components/STools";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

function Timer(props: any) {
  const { timerState, timerSetter, ...otherProps } = props;

  return (
    <Box
      position="absolute"
      top="40px"
      left="40px"
      width="fit-content"
      height="25px"
    >
      {timerState.useTimer ? (
        <Box bgColor="white">
          <Countdown
            date={Date.now() + timerState.time}
            onComplete={() => timerSetter({ useTimer: false })}
          ></Countdown>
        </Box>
      ) : (
        <div></div>
      )}
    </Box>
  );
}

function parseTools(modifiers: Object) {
  //console.log("MODIFIERS : ", modifiers);
  let toolNames = [];
  for (const [key, value] of Object.entries(modifiers)) {
    if (key.includes("stu-") && value === true) {
      toolNames.push(key.replace("stu-", ""));
    }
  }
  //console.log("TOOL NAMES : ", toolNames);
  let tools = Object.fromEntries(
    toolNames.map((toolName) => {
      let toolModifiers = {};
      for (const [key, value] of Object.entries(modifiers)) {
        if (key.includes("st-" + toolName + "-") && value !== undefined) {
          // @ts-ignore
          toolModifiers[
            key.replace("st-" + toolName + "-", "") //.replace(/-/g, "_")
          ] = value;
        }
      }
      return [toolName, toolModifiers];
    })
  );
  //console.log("TOOLS : ", tools);
  return tools;
}

function ImagePreview(props: any) {
  const { imageSrc, isOpen, onClose, ...otherProps } = props;
  if (isOpen)
    return (
      <Box position="absolute" w="100vw" h="100vh" m="0" p="0" {...otherProps}>
        <Flex flexDir="column" w="100%" h="100%">
          <TransformWrapper
            initialScale={1}
            // initialPositionX={200}
            // initialPositionY={100}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <>
                <Flex height="40px" width="100%">
                  <Button
                    onClick={() => zoomIn()}
                    w="100%"
                    rounded="none"
                    colorScheme="whatsapp"
                    roundedTopLeft="12px"
                  >
                    Zoom In
                  </Button>{" "}
                  <Button
                    onClick={() => zoomOut()}
                    w="100%"
                    rounded="none"
                    colorScheme="whatsapp"
                    //roundedTop="12px"
                  >
                    Zoom Out
                  </Button>{" "}
                  <Button
                    onClick={() => resetTransform()}
                    w="100%"
                    rounded="none"
                    colorScheme="whatsapp"
                    //roundedTop="12px"
                  >
                    Reset Transform
                  </Button>
                  <Button
                    onClick={onClose}
                    w="100%"
                    rounded="none"
                    colorScheme="red"
                    roundedTopRight="12px"
                  >
                    Close
                  </Button>
                </Flex>

                <TransformComponent>
                  <img src={imageSrc} />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </Flex>
      </Box>
    );
}

function JoyPlayer(props: any) {
  const [imgSrc, setImgSrc] = useState("");
  const [gameDir, setGameDir] = useState(null);
  const [assetSrc, setAssetSrc] = useState("");
  const [currentAction, setCurrentAction] = useState({});
  const [temp, setTemp] = useState(0);
  const [box, setBox] = useState(<div></div>);
  const [tools, setTools] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    setInterval(() => {
      setTemp((prevTemp) => prevTemp + 1);
    }, 100);
  }, []);

  useEffect(() => {
    invoke("get_current_action").then((res: any) => {
      let action = JSON.parse(res);
      if (JSON.stringify(action) !== JSON.stringify(currentAction)) {
        handleAction(action); // If the user hasn't moved actions don't handle it just ignore it.
      }
    });
  }, [temp]);

  const handleAction = (action: any) => {
    setCurrentAction(action);
    //console.log("action : ", action);
    if (action["modifiers"]["image"]) {
      setImgSrc(action["modifiers"]["image"]);
    }
    //@ts-ignore
    setTools(parseTools(action["modifiers"]));

    if (action["event_type"] === "Dialogue") {
      //console.log(res);
      setBox(
        <DialogueBox
          character_name={action["character_name"]}
          text={action["text"]}
          modifiers={action["modifiers"]}
          height="100%"
        />
      );
    } else if (action["event_type"] === "Choice") {
      setBox(
        <ChoiceBox
          choices={action["choices"]}
          modifiers={action["modifiers"]}
          height="100%"
        />
      );
    }
  };

  useEffect(() => {
    invoke("get_absolute_game_path").then((res: any) => {
      if (res !== gameDir) {
        setGameDir(res);
      }
    });
  }, [gameDir]);
  if (gameDir) {
    join(gameDir, imgSrc).then((path) => {
      setAssetSrc(convertFileSrc(path));
    });
  }
  return (
    <>
      <Box
        position="absolute"
        w="100vw"
        h="100vh"
        m="0"
        p="0"
        border="2px"
        rounded="12px"
        borderColor="pink.200"
        zIndex="1"
        pointerEvents="none"
      ></Box>{" "}
      <ImagePreview
        imageSrc={assetSrc}
        onClose={onClose}
        isOpen={isOpen}
        zIndex="1"
      />
      {/* This is a hack to fix the bug where the border isn't in full overlay. */}
      <SToolsContainer tools={tools} />
      <Flex direction="column" h="100vh" overflow="hidden" bgColor="purple.900">
        <Box h="65%">
          <Center h="100%" mt="10px">
            <Image onClick={onOpen} src={assetSrc} height="100%" width="auto" />
          </Center>
        </Box>

        <Box
          h="30%"
          mt="10px"
          overflowY="auto"
          position="absolute"
          bottom="5%"
          bgColor="pink"
        >
          <DialogueDisplay box={box} />
        </Box>

        <Box h="5%" w="100%" bottom="0" position="absolute">
          <BottomBar />
        </Box>
      </Flex>
    </>
  );
}

export default JoyPlayer;
/**
    <Box padding="5px" minH="100vh" width="100vw" bgColor="purple.900">
      <Box width="100%" height="65vh">
        <Image src={imgSrc} width="auto" height="100%" margin="0 auto" />
      </Box>
      <Box height="35vh">
        <DialogueDisplay imageSetter={setImgSrc} height="100%" />
      </Box>
    </Box>
     */
