export function ArizaTitle({ type }: { type: string }) {
  return (
    <>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '24px',
          letterSpacing: 5
        }}
      >
        ARIZA
      </h1>
      <p style={{ textAlign: 'center' }}>
        <i>({type})</i>
      </p>
    </>
  );
}
