/* TriWizard brand deck — UI element gallery. window.DeckElements.Gallery.
   Themed by the slide wrapper; reuses DS primitives + the kit's CharacterCard. */
(function () {
  const DS = window.TriWizardDesignSystem_a98f10;
  const { Button, IconButton, Badge, Tag, Avatar, Input, Select, Switch, Checkbox, Tabs, CharacterCard, DiceRoller, StatBlock, Timeline } = DS;

  const Plus = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7.5 2v11M2 7.5h11" /></svg>;

  function Section({ title, children, style }) {
    return (
      <div style={{ ...style }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-text)', marginBottom: 14 }}>{title}</div>
        {children}
      </div>
    );
  }

  function Gallery() {
    const [tab, setTab] = React.useState('sheet');
    return (
      <div style={{ height: '100%', width: '100%', overflow: 'hidden', background: 'var(--surface-page)', padding: '36px 48px' }} className="tw-stone-wash">
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 0.9fr', gap: 44, height: '100%' }}>
          {/* column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <Section title="Buttons">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <Button>Swear the Oath</Button>
                <Button variant="secondary">Withdraw</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <Button variant="danger">Strike Record</Button>
                <Button iconStart={<Plus />}>New</Button>
                <IconButton label="Add" variant="solid"><Plus /></IconButton>
                <IconButton label="On" active><Plus /></IconButton>
              </div>
            </Section>
            <Section title="Badges & Tags">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <Badge tone="accent" dot>Active</Badge>
                <Badge tone="alive" dot>Alive</Badge>
                <Badge tone="wounded" dot>Wounded</Badge>
                <Badge tone="dead" dot>Fallen</Badge>
                <Badge tone="ember" outline>Master</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Tag>Runecraft</Tag>
                <Tag selected>Selected</Tag>
                <Tag onRemove={() => {}}>Removable</Tag>
              </div>
            </Section>
            <Section title="Form controls">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
                <Input defaultValue="Ivar the Drowned" />
                <Select defaultValue="rune"><option value="rune">Runecraft</option><option value="pyro">Pyromancy</option></Select>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <Checkbox defaultChecked label="Oathbound" />
                  <Switch defaultChecked label="Master mode" size="sm" />
                </div>
              </div>
            </Section>
            <Section title="Tabs">
              <Tabs value={tab} onChange={setTab} tabs={[{ value: 'sheet', label: 'Sheet' }, { value: 'chron', label: 'Chronicle', count: 12 }, { value: 'comm', label: 'Remarks', count: 4 }]} />
            </Section>
          </div>

          {/* column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <Section title="Character card">
              <CharacterCard name="Kára Nightveil" epithet="Reader of the drowned" faction="House Ash" level={6} status="alive" initials="KN"
                vitals={[{ label: 'HP', value: 21 }, { label: 'Armour', value: 2 }, { label: 'Standing', value: 88 }]} />
            </Section>
            <Section title="Attributes">
              <StatBlock columns={3} stats={[
                { label: 'STR', value: 9, modifier: -1 }, { label: 'DEX', value: 14, modifier: 2 }, { label: 'CON', value: 12, modifier: 1 },
                { label: 'INT', value: 17, modifier: 3 }, { label: 'WIS', value: 16, modifier: 3 }, { label: 'CHA', value: 11, modifier: 0 }]} />
            </Section>
            <Section title="Avatars">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar initials="IV" status="wounded" />
                <Avatar initials="KN" ring status="alive" />
                <Avatar initials="DV" square status="dead" />
                <Avatar initials="SF" size="lg" />
              </div>
            </Section>
          </div>

          {/* column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <Section title="Dice">
              <DiceRoller defaultSides={20} modifier={3} dice={[6, 8, 12, 20]} />
            </Section>
            <Section title="Chronicle">
              <Timeline events={[
                { time: 'Year I', title: 'The Crossing', tone: 'neutral' },
                { time: 'Year III', title: 'Oath of Salt', tone: 'accent' },
                { time: 'Year IV', title: 'The Drowning', tone: 'dead' }]} />
            </Section>
          </div>
        </div>
      </div>
    );
  }

  window.DeckElements = { Gallery };
})();
