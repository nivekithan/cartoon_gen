import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { hc } from "./lib/hc";
import { Textarea } from "./components/ui/textarea";

function App() {
  const [topicInput, setTopicInput] = useState("");

  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const response = await hc.images.$get();

      const images = await response.json();

      return images.data;
    },
  });
  const { mutate: generateImage, isPending } = useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  return (
    <div className="container mx-auto">
      <div className="min-h-[calc(100vh-320px)] grid place-items-center">
        <div className="scale-125">
          <Card>
            <CardHeader>
              <CardTitle>Generate Cartoon</CardTitle>
              <CardDescription>
                Describe the topic of your cartoon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  console.log({ topicInput });
                  e.preventDefault();
                  generateImage(topicInput);
                }}
                className="flex flex-col gap-3"
              >
                <Label>Topic:</Label>
                <Textarea
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
        </div>
      </div>
      {data ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {data.map((image) => {
            const srcUrl = new URL(
              image.key,
              import.meta.env.VITE_CARTOON_IMAGE_BUCKET,
            ).toString();
            return (
              <li key={image.id} className="relative">
                <a href={srcUrl} target="_blank" className="select-none">
                  <div className="group aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <img
                      src={srcUrl}
                      key={image.id}
                      alt="cartoon"
                      className="pointer-events-none object-cover group-hover:opacity-75"
                    />
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default App;
