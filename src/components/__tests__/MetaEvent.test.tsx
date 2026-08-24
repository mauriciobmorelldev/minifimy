import { render, waitFor } from "@testing-library/react";
import { MetaEvent } from "@/components/MetaEvent";

describe("MetaEvent persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.fbq = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete window.fbq;
  });

  it("emits a persisted Purchase only once when confirmation is reopened", async () => {
    const props = {
      name: "Purchase" as const,
      eventKey: "purchase-321",
      eventId: "purchase-321",
      persistKey: "purchase-321",
      data: { order_id: "321", value: 42500, currency: "ARS" },
      order: { id: 321, key: "wc_order_example" },
    };

    const firstRender = render(<MetaEvent {...props} />);
    await waitFor(() => expect(window.fbq).toHaveBeenCalledTimes(1));
    firstRender.unmount();

    render(<MetaEvent {...props} />);
    await waitFor(() => expect(window.fbq).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
