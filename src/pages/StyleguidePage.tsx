import { useState, type ReactNode } from 'react';
import {
  colorTokens,
  contrastChecks,
  type ColorToken,
  type ContrastCheck,
} from '@/lib/designTokens';
import { contrastRatio, meetsWcagAaForLargeText, meetsWcagAaForNormalText } from '@/lib/color';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { FloralOrnament } from '@/components/ui/FloralOrnament';
import { LocationIcon } from '@/components/ui/LocationIcon';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';

const CONTRAST_RATIO_DECIMALS = 2;

const ColorSwatch = ({ token }: { token: ColorToken }): ReactNode => (
  <li className="flex items-center gap-3 rounded border border-black/10 p-3">
    <span
      aria-hidden="true"
      className="size-12 shrink-0 rounded border border-black/10"
      style={{ backgroundColor: token.hexValue }}
    />
    <div>
      <p className="font-semibold">
        {token.cssVariable} <span className="font-normal">({token.hexValue})</span>
      </p>
      <p className="text-sm">{token.usage}</p>
      <p className="text-sm">
        {token.verified ? 'Verified against Figma' : 'Approximate, pending verification'}
      </p>
    </div>
  </li>
);

const ColorsSection = (): ReactNode => (
  <>
    <h2 className="mt-6 text-xl font-semibold">Colors</h2>
    <ul className="mt-2 grid gap-2">
      {colorTokens.map((token) => (
        <ColorSwatch key={token.cssVariable} token={token} />
      ))}
    </ul>
  </>
);

const ContrastRow = ({ check }: { check: ContrastCheck }): ReactNode => {
  const ratio = contrastRatio(check.foregroundHex, check.backgroundHex);
  const passes = check.requiresLargeText
    ? meetsWcagAaForLargeText(check.foregroundHex, check.backgroundHex)
    : meetsWcagAaForNormalText(check.foregroundHex, check.backgroundHex);

  return (
    <tr>
      <td className="border border-black/10 p-2">{check.label}</td>
      <td className="border border-black/10 p-2">{ratio.toFixed(CONTRAST_RATIO_DECIMALS)}:1</td>
      <td className="border border-black/10 p-2">{passes ? 'Passes AA' : 'Fails AA'}</td>
    </tr>
  );
};

const ContrastSection = (): ReactNode => (
  <>
    <h2 className="mt-6 text-xl font-semibold">Contrast (WCAG AA)</h2>
    <table className="mt-2 w-full border-collapse text-left">
      <thead>
        <tr>
          <th className="border border-black/10 p-2">Pair</th>
          <th className="border border-black/10 p-2">Ratio</th>
          <th className="border border-black/10 p-2">Result</th>
        </tr>
      </thead>
      <tbody>
        {contrastChecks.map((check) => (
          <ContrastRow key={check.label} check={check} />
        ))}
      </tbody>
    </table>
  </>
);

const RadiusAndShadowSection = (): ReactNode => (
  <>
    <h2 className="mt-6 text-xl font-semibold">Radius &amp; shadow</h2>
    <p>--radius-invitation-sm: 5px (verified: Hotel button and dress-code note border-radius)</p>
    <p>
      --shadow-invitation-badge: 2px 2px 1px rgba(0, 0, 0, 0.25) (verified: Waze/Google location
      badges)
    </p>
  </>
);

const TypographySection = (): ReactNode => (
  <>
    <h2 className="mt-6 text-xl font-semibold">Typography</h2>
    <p className="font-sans font-normal">
      Inter Regular — Y será un placer que puedas acompañarnos.
    </p>
    <p className="font-sans font-bold">
      Inter Bold — Confirma tu asistencia antes del 25 de octubre.
    </p>
    <p className="font-script text-3xl">Great Vibes — Fredy y Fátima</p>
    <p className="text-sm">
      Self-hosted from `public/fonts/`, latin subset only (covers every Spanish accent and ñ —
      latin-ext is for other Latin-script languages, not needed here). Inter ships as a single
      variable file spanning weights 400-700; Great Vibes is static Regular only.
    </p>
  </>
);

const ModalDemo = (): ReactNode => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = (): void => {
    setIsOpen(true);
  };
  const closeModal = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={openModal}>Abrir modal de ejemplo</Button>
      <Modal isOpen={isOpen} onClose={closeModal} titleId="demo-modal" title="Confirmar">
        <p>Esta acción no se puede deshacer.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="secondary" className="flex-1 text-center" onClick={closeModal}>
            Volver
          </Button>
          <Button className="flex-1 text-center" onClick={closeModal}>
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  );
};

const ComponentsSection = (): ReactNode => (
  <>
    <h2 className="mt-6 text-xl font-semibold">Components</h2>

    <h3 className="mt-4 font-semibold">Button</h3>
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <Button>Enviar</Button>
      <Button variant="secondary">Ver mapa</Button>
      <Button variant="dark">Confirmar</Button>
      <Button disabled>Deshabilitado</Button>
      <Button isLoading loadingLabel="Enviando…">
        Enviar
      </Button>
    </div>

    <h3 className="mt-4 font-semibold">Select</h3>
    <Select aria-label="Cantidad de personas" defaultValue="1" className="mt-2">
      <option value="1">1 persona.</option>
      <option value="2">2 personas.</option>
      <option value="3">3 personas.</option>
    </Select>

    <h3 className="mt-4 font-semibold">Card</h3>
    <div className="mt-2 grid gap-2 sm:grid-cols-3">
      <Card variant="dark">surface-dark</Card>
      <Card variant="sage">surface-sage</Card>
      <Card variant="muted">surface-muted</Card>
    </div>

    <h3 className="mt-4 font-semibold">Divider</h3>
    <Divider className="mt-2" />

    <h3 className="mt-4 font-semibold">FloralOrnament</h3>
    <FloralOrnament
      src="/assets/ornaments/flores-encabezado.webp"
      className="mt-2 w-40"
      isPriority
    />

    <h3 className="mt-4 font-semibold">LocationIcon</h3>
    <div className="mt-2 flex gap-4">
      <LocationIcon brand="waze" className="size-16" />
      <LocationIcon brand="google-maps" className="size-16" />
    </div>

    <h3 className="mt-4 font-semibold">Modal</h3>
    <div className="mt-2">
      <ModalDemo />
    </div>
  </>
);

const StyleguidePage = (): ReactNode => {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Styleguide</h1>
      <ColorsSection />
      <ContrastSection />
      <RadiusAndShadowSection />
      <TypographySection />
      <ComponentsSection />
    </main>
  );
};

export default StyleguidePage;
