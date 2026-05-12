import Logo from './Logo'
import xLogo from './images/x-logo.svg'
import githubLogo from './images/github-logo.svg'
import hfLogo from './images/hf-logo-pirate.svg'

type SocialLink = {
  href: string
  src: string
  alt: string
  imgClass: string
}

const socials: SocialLink[] = [
  { href: 'https://twitter.com/CompendiumLabs', src: xLogo, alt: 'X', imgClass: 'h-8 max-md:h-14' },
  { href: 'https://github.com/CompendiumLabs', src: githubLogo, alt: 'GitHub', imgClass: 'w-9 max-md:w-16' },
  { href: 'https://huggingface.co/CompendiumLabs', src: hfLogo, alt: 'Hugging Face', imgClass: 'w-9 max-md:w-16' },
]

export default function App() {
  return (
    <div className="relative mx-auto flex h-full w-3/5 max-md:w-4/5 flex-col items-center justify-center gap-6">
      <Logo size={1000} theme="dark" aspect={2} />

      <div className="text-5xl font-bold max-md:text-7xl">Compendium Labs</div>

      <div className="text-2xl max-md:text-5xl">
        <a href="mailto:hello@compendiumlabs.ai">hello@compendiumlabs.ai</a>
      </div>

      <div className="flex items-center justify-center gap-3 max-md:gap-6">
        {socials.map(({ href, src, alt, imgClass }) => (
          <a key={alt} href={href} className="flex items-center">
            <img src={src} alt={alt} className={imgClass} />
          </a>
        ))}
      </div>

      <div className="mt-32 text-3xl">
        NEW: Check out the{' '}
        <a href="https://compendiumlabs.ai/blog/gum">Gum blog post</a>!
      </div>
    </div>
  )
}
