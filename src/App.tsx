import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Box, Text, Image, Button, Flex, List } from "@chakra-ui/react";

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
      <Text>{character_name} : </Text>
      <Text
        fontWeight="thin"
        fontSize="large"
        color="white"
        {...dlg_text_modifiers}
      >
        {text}
      </Text>
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
  const [beginLoop, setBeginLoop] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setTemp((prevTemp) => prevTemp + 1);
    }, 100);
  }, [beginLoop]);

  useEffect(() => {
    invoke("get_current_action").then((res: any) => {
      let action = JSON.parse(res);
      handleAction(action);
    });
  }, [temp]);

  const handleAction = (action: any) => {
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

  const getNextAction = async () => {
    console.log("Next");
    await invoke("next_action").then((res) => {
      invoke("get_current_action").then((res: any) => {
        let action = JSON.parse(res);
        handleAction(action);
      });
    });
    if (!beginLoop) {
      setBeginLoop(true);
    }
  };

  return (
    <Box width="100vw" {...otherProps}>
      <Box bgColor="gray.800">{box}</Box>
      <Button width="100%" onClick={getNextAction}>
        Next Action
      </Button>
    </Box>
  );
}

function App() {
  const [imgSrc, setImgSrc] = useState("");
  const loadGame = () => {
    invoke("read_game", { gameArchivePath: "./test_game/" }).then(() =>
      console.log("DONE")
    );
  };
  return (
    <Box margin="5px" height="100vh" width="100vw">
      Narra Test
      <Image src={imgSrc} height="70%" width="auto" />
      <DialogueDisplay imageSetter={setImgSrc} height="30%" />
      <Button onClick={loadGame}> init </Button>
    </Box>
  );
}

export default App;
