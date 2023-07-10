import { Box, Button, Flex, Input, Spacer, Text } from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage(props: any) {
  const navigate = useNavigate();
  const [packageName, setPackageName] = useState("./joiport");
  return (
    <Box bgColor="purple.900" height="100vh">
      <Box paddingTop="120px">
        <Text
          fontFamily="mono"
          fontSize="6xl"
          fontWeight="light"
          textAlign="center"
          color="white"
        >
          joy
        </Text>
      </Box>
      <Box>
        <form>
          <Flex flexDir="row" marginTop="40px">
            <Input
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Package name"
              content={packageName}
              rounded="base"
              marginLeft="35px"
              outlineColor="white"
              borderColor="white"
              color="white"
            />
            <Button
              type="submit"
              rounded="base"
              width="145px"
              marginLeft="25px"
              marginRight="25px"
              color="purple.600"
              onClick={() => {
                invoke("read_game", { gameArchivePath: packageName });
                navigate("/joy");
              }}
            >
              Load Joy file
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}

export default HomePage;
