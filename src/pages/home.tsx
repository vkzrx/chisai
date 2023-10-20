import { Layout } from "../components/layout";

type HomeProps = {
  name: string;
};

export const HomePage = (props: HomeProps) => {
  return (
    <Layout title="Shorty | Home">
      <h1 class="bg-red-500">Hello {props.name}</h1>
    </Layout>
  );
};
