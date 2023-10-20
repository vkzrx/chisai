type HomeProps = {
  name: string;
};

export const HomePage = (props: HomeProps) => {
  return <h1 class="bg-red-500">Hello {props.name}</h1>;
};
