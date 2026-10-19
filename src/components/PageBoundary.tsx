import React from 'react';
// Lazy chunks can disappear during a deployment or fail on a weak connection.
// Leave recovery to the user rather than silently reloading an unsaved form.
export class PageBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section role="alert" className="qp-container py-8">
          <h2 className="text-xl font-semibold">
            Halaman belum dapat ditampilkan
          </h2>
          <p className="mt-3">
            Periksa koneksi, lalu muat ulang. Draf kasir dan keranjang yang
            tersimpan di perangkat akan tetap tersedia. Jangan mencatat ulang
            transaksi yang sudah mendapat konfirmasi tersimpan.
          </p>
          <button
            className="qp-button mt-5"
            onClick={() => window.location.reload()}
          >
            Muat ulang halaman
          </button>
        </section>
      );
    return this.props.children;
  }
}
