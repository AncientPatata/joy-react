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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
function DialogueBox(props: any) {
  const { character_name, text, modifiers, ...otherProps } = props;

  let dlg_text_modifiers = Object.keys(modifiers)
    .filter((key) => key.includes("text-"))
    .map((key) => key.replace("text-", ""))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: modifiers["text-" + key],
      };
    }, {});
  // console.log("DLG TEXT MODIFIERS");
  // console.log(dlg_text_modifiers);

  return (
    <Box {...otherProps}>
      <Box textAlign="center" color="white" fontSize="2xl" paddingTop="7px">
        <Text>{character_name}</Text>
      </Box>
      <Box
        minHeight="100%"
        paddingLeft="15px"
        paddingRight="15px"
        paddingBottom="15px"
        overflowY="auto"
      >
        <Text
          fontWeight="thin"
          fontSize="large"
          color="white"
          {...dlg_text_modifiers}
        >
          {text}
        </Text>
      </Box>
    </Box>
  );
}

function ChoiceBox(props: any) {
  const { choices, modifiers, ...otherProps } = props;
  const performChoice = async (index: Number) => {
    invoke("perform_choice", { choice: index }).then((res) => {
      invoke("next_action");
    });
  };

  let choice_text_modifiers = Object.keys(modifiers)
    .filter((key) => key.includes("text-"))
    .map((key) => key.replace("text-", ""))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: modifiers["text-" + key],
      };
    }, {});

  return (
    <Box {...otherProps}>
      <Text {...choice_text_modifiers}>
        {modifiers["text"] && <Text>{modifiers["text"]}</Text>}
      </Text>
      <Flex flexDir="column" height="100px">
        {choices.map((choice: String, index: Number) => {
          return (
            <Button
              onClick={() => performChoice(index)}
              rounded="none"
              marginTop="5px"
            >
              Choice : {choice}
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
}

function DialogueDisplay(props: any) {
  const { imageSetter, ...otherProps } = props;
  const [box, setBox] = useState(<div />);

  const [temp, setTemp] = useState(0);
  const [currentAction, setCurrentAction] = useState({});

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
    if (action["modifiers"]["image"]) {
      invoke("get_image", {
        imageFilepath: action["modifiers"]["image"],
      }).then((b64: any) => {
        //console.log("data:image/jpeg;base64," + b64);
        imageSetter("data:image/jpeg;base64," + b64);
      });
    }
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

  return (
    <Box width="100vw" height="100%" {...otherProps}>
      <Box bgColor="gray.800" height="100%">
        {box}
      </Box>
    </Box>
  );
}

function BottomBar(props: any) {
  const navigate = useNavigate();

  const getNextAction = async () => {
    console.log("Next");
    await invoke("next_action");
  };
  return (
    <Box color="gray.100" height="100%" width="100%">
      <Flex
        flexDir="row"
        height="100%"
        width="100%"
        alignItems="center"
        justifyContent="center"
        gap="8px"
      >
        <Button
          onClick={getNextAction}
          height="100%"
          width="80px"
          rounded="none"
          fontSize="xl"
        >
          Next
        </Button>
        <Button
          onClick={() => navigate("/")}
          height="100%"
          width="80px"
          rounded="none"
          fontSize="xl"
        >
          End
        </Button>
      </Flex>
    </Box>
  );
}

function JoyPlayer(props: any) {
  const [imgSrc, setImgSrc] = useState("");
  return (
    <Flex
      direction="column"
      h="100vh"
      overflow="hidden"
      bgColor="purple.900"
      border="2px"
      borderColor="pink.200"
    >
      <Box h="65%">
        <Center h="100%" mt="10px">
          <Image src={imgSrc} height="100%" width="auto" />
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
        <DialogueDisplay imageSetter={setImgSrc} />
      </Box>

      <Box h="5%" w="100%" bottom="0" position="absolute">
        <BottomBar />
      </Box>
    </Flex>
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
