import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const BrowseDisasters = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4 block">
                Active Response Registry
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface mb-6">
                Global Disaster <br />
                <span className="text-primary">Catalog</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
                A real-time comprehensive record of environmental crises, human relief efforts, and verified impact
                metrics powered by DeReFund.
              </p>
            </div>
            <div className="lg:col-span-5 flex justify-end">
              <div className="bg-surface-container-high p-6 rounded-xl w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-on-surface-variant">Active Incidents</span>
                  <span className="flex h-2 w-2 rounded-full bg-tertiary animate-pulse" />
                </div>
                <div className="text-4xl font-black tracking-tight text-on-surface">14</div>
                <div className="mt-2 text-xs text-on-surface-variant font-medium uppercase tracking-wider">
                  Verified Global Emergencies
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <section className="mb-12 sticky top-20 z-40">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xl flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                type="text"
                className="w-full bg-surface-container-high border-none rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary text-on-surface transition-all placeholder:text-outline-variant"
                placeholder="Search by disaster type or location..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 bg-surface-container-high rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Disaster Type
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 bg-surface-container-high rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors"
              >
                <span className="material-symbols-outlined text-sm">warning</span>
                Severity
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-lg text-sm font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </section>

        {/* Disaster Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Urgent Priority Card */}
          <article className="lg:col-span-2 group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLOxm57x-Tm_Ny4_xhuu_xtMtVakpHw7rXSOzCIpE2qxze-s46DZz_4da63Kgv-0J_VLi-FfF93ySKBjVN2CG-x-xMqwgXLI0UKb_ffRg7bT3ZvTBQTLyBZs-nwBr8-HbVDOObib8tWi-_orCU3m7jrxd_2SDEX1KjdXGz43Kv_pYkyAHrVIOpBsm1iVSWZp2o8OSOlqnS0NGrG7p-_7eSOkqYnKnvd7n442AXsk0tEUYcth4Bgf5B7QSOJCEUn6Wwudv_xeRcpsc"
                  alt="Catastrophic basin flooding"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-tertiary text-on-tertiary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Urgent Relief
                  </span>
                </div>
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tighter mb-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Rio Grande do Sul, Brazil
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter text-on-surface mb-4">
                    Catastrophic Basin Flooding
                  </h3>
                  <p className="text-on-surface-variant line-clamp-3 leading-relaxed mb-6">
                    Unprecedented rainfall has caused river basins to overflow, displacing over 150,000 residents and
                    crippling local infrastructure. Immediate relief funds are being channeled to emergency shelter and
                    water purification.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-outline uppercase font-bold tracking-widest">Verified Status</span>
                    <span className="text-secondary font-bold text-sm">Relief Active</span>
                  </div>
                  <button
                    type="button"
                    className="bg-primary text-on-primary px-6 py-2 rounded-md font-bold text-sm hover:bg-primary-container transition-colors"
                  >
                    View Impact
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Standard Card 1 */}
          <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="relative h-48">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh9Ku_w2z3_Uj_OAKxfBpf1qtqKDcn8Ha8UeyUYg32pFt1w0SXPIJgyAUxKuywiKsXVA-JeB-v-53Yg4UPcIv6ZGTa71cXTuTmxM51b8NUN5iGZ3foGvhAFb48mHK1Y7Yp1cYKZIrm6-7g_tJXV5K9So1JHklIyxNo7PZqpQtcUpHarBc2d5tmc8c0QGfnO3gCWXcRSD6tWNxDLvSA_vmixc9O_f-hJH0gosI5ZL8DeWFkUE5UBLUjqpG7CXSg_GyipY8XnWvQQ-8"
                alt="Hualien seismic event"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-1 rounded uppercase">
                  Verified
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">Taiwan</div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface mb-3">Hualien Seismic Event</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                Significant structural damage reported in mountainous regions. Rescue operations in final stages.
              </p>
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-surface-container">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Severity: <span className="text-tertiary">Critical</span>
                </span>
                <button
                  type="button"
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>

          {/* Standard Card 2 */}
          <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="relative h-48">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8t8fNOWoKRjkLzAdyr49b7mNCkLI3Bx-HCLHIarSPO5wvJ2t-osZeFqPdDUf3StqsYAl1iI5J2yaPBxExt7Tt16x5wAr8SAEKH8vB8XWVR9Za4be7hyMMa0tZJjQfonN5DrfgPNyYSlph8z-bS2AZme70Kd2tybxQmIKQZVSXS0vhSGYJoQVGVXNugXFHIZWI8hk-Nd-m4VhTM3UukPANnI-cFFv4dE6uCxWoYi0hQxdX5ft3xF78OjpuQ4XeoRAz7tCXCLUSgNo"
                alt="Summer range wildfires"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-black px-2 py-1 rounded uppercase">
                  Pending
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">
                British Columbia
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface mb-3">Summer Range Wildfires</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                Rapidly spreading blaze threatening regional timber reserves and nearby settlements.
              </p>
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-surface-container">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Severity: <span className="text-on-secondary-container">Moderate</span>
                </span>
                <button
                  type="button"
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>

          {/* Standard Card 3 */}
          <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="relative h-48">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUV5W1ivnjzoFrsTxkOVv5TT8ylBo4ImHGJawFKHgOx334AXBdI5dbxjT2uxco33LGvvViZSNBNjmGP4UmD6Kt4gFsIz3YjVTy_Tbmu7yuo1ZC45HdAfN7AxDMKt_DEe0bOCq0AIpGF9Uvuo0lJvnEUrgSMiW_VpeozEHP_qT8Q8gktQOPl8NRfOu_vPYJJSt5hoE6K1qa728BGczShI9o0lp7X4NrLfrrJpeg04tMmd2AeZJr87OWrO3APGTt7qegtV4L8HNFfzs"
                alt="Regional aridity crisis"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-1 rounded uppercase">
                  Verified
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">Somalia</div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface mb-3">Regional Aridity Crisis</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                Long-term drought affecting agricultural yields and livestock sustainability. Permanent relief project
                active.
              </p>
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-surface-container">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Severity: <span className="text-tertiary">Severe</span>
                </span>
                <button
                  type="button"
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>

          {/* Standard Card 4 */}
          <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="relative h-48">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_w2Ho0pHJMrgx3z36ykLUV3-Ac1wjA4exQYE5tvz51IpdTFGscaPhR6sALKAuyC7zgX0aevXlZ-fnp8UA69sqPcdM6TQq8BQZPxZF8yu4WMPXsffMbJXt8CCH0BORMF82za67lAI5_HC6c-ihXHp0GYN2iKYtpmPD3m_TOV_y7THskzk5v41i7gDJz02YevQtFdsRChU8i2bR5MzLnBXyNllYhpK3XSP2BRPDOK-hy52Mbkk4t_gVpNeKr7F4uKrnD2LJIJnuPS8"
                alt="Hurricane Idalia aftermath"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-black px-2 py-1 rounded uppercase">
                  Verified
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">
                Gulf Coast, USA
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface mb-3">Hurricane Idalia Aftermath</h3>
              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                Reconstruction phase for coastal communities impacted by high storm surges and wind damage.
              </p>
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-surface-container">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Severity: <span className="text-secondary">Recovering</span>
                </span>
                <button
                  type="button"
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        {/* Pagination */}
        <div className="mt-16 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold"
            >
              1
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              3
            </button>
            <span className="px-2 text-outline-variant">...</span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              12
            </button>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseDisasters;

