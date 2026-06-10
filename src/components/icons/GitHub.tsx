import { siGithub } from 'simple-icons';

function GitHub(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d={siGithub.path} />
    </svg>
  );
}

export default GitHub;
