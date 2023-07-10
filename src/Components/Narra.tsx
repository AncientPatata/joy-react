import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Box, Text, Button, Flex } from "@chakra-ui/react";
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
  const { imageSetter, box, ...otherProps } = props;

  return (
    <Box width="100vw" m="0" p="0" height="100%" {...otherProps}>
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

export { DialogueDisplay, BottomBar, DialogueBox, ChoiceBox };
