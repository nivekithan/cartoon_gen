import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { hc } from "./lib/hc";

function App() {
  const [topicInput, setTopicInput] = useState("");

  const {
    data,
    mutate: generateImage,
    isPending,
  } = useMutation({
    mutationFn: async (topic: string) => {
      try {
        const response = await hc.generate.$post(
          { json: { prompt: topic } },
          { headers: { "Content-Type": "application/json" } },
        );

        const body = await response.json();

        const imageUrl = body.data;

        return imageUrl;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  });

  return (
    <div className="min-h-scren flex flex-col items-center px-[10%] py-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Cartoon</CardTitle>
          <CardDescription>Describe the topic of your cartoon</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              console.log({ topicInput });
              e.preventDefault();
              generateImage(topicInput);
            }}
            className="flex flex-col gap-2"
          >
            <Label>Topic:</Label>
            <Input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.currentTarget.value)}
              name="topic"
            />
            <Button type="submit">
              {isPending ? "Generating..." : "Generate"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {data ? <img src={data} alt="Cartoon" /> : null}
    </div>
  );
}

export default App;
