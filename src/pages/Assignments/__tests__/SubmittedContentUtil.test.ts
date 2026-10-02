import axiosClient from "../../../utils/axios_client";
import {
  createFolder,
  deleteFiles,
  downloadFile,
  listFiles,
  removeHyperlink,
  submitFile,
  submitHyperlink,
  validateFile,
  validateUrl,
} from "../SubmittedContentUtil";

vi.mock("../../../utils/axios_client", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const mockedClient = axiosClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("SubmittedContentUtil", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("listFiles sends the participant id and a flat folder[name] param", async () => {
    mockedClient.get.mockResolvedValueOnce({ data: { files: [], folders: [], hyperlinks: [] } });

    const result = await listFiles(123, "/diagrams");

    expect(mockedClient.get).toHaveBeenCalledWith("/submitted_content/list_files", {
      params: { id: 123, "folder[name]": "/diagrams" },
    });
    expect(result).toEqual({ files: [], folders: [], hyperlinks: [] });
  });

  test("submitFile posts multipart form data with uploaded_file", async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { message: "ok" } });

    const file = new File(["test content"], "test.pdf", { type: "application/pdf" });
    await submitFile(123, file, "/", true);

    const [url, body, config] = mockedClient.post.mock.calls[0];
    expect(url).toBe("/submitted_content/submit_file");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("id")).toBe("123");
    expect(body.get("uploaded_file")).toBe(file);
    expect(body.get("current_folder[name]")).toBe("/");
    expect(body.get("unzip")).toBe("true");
    expect(config.headers["Content-Type"]).toBe("multipart/form-data");
  });

  test("submitFile omits unzip when not requested", async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { message: "ok" } });

    await submitFile(123, new File(["x"], "a.txt"));

    expect(mockedClient.post.mock.calls[0][1].get("unzip")).toBeNull();
  });

  test("submitHyperlink uses the submit_link param name the controller reads", async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { message: "submitted" } });

    await submitHyperlink(123, "https://example.com");

    expect(mockedClient.post).toHaveBeenCalledWith("/submitted_content/submit_hyperlink", {
      id: 123,
      submit_link: "https://example.com",
    });
  });

  test("removeHyperlink issues a DELETE carrying the index in the body", async () => {
    mockedClient.delete.mockResolvedValueOnce({ status: 204 });

    await removeHyperlink(123, 2);

    expect(mockedClient.delete).toHaveBeenCalledWith("/submitted_content/remove_hyperlink", {
      data: { id: 123, chk_links: 2 },
    });
  });

  test("downloadFile requests a blob from the download endpoint", async () => {
    const blob = new Blob(["test"], { type: "application/pdf" });
    mockedClient.get.mockResolvedValueOnce({ data: blob });

    const result = await downloadFile(123, "test.pdf", "/");

    expect(mockedClient.get).toHaveBeenCalledWith("/submitted_content/download", {
      params: { id: 123, "current_folder[name]": "/", download: "test.pdf" },
      responseType: "blob",
    });
    expect(result).toBe(blob);
  });

  test("createFolder posts faction[create]", async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { message: "created" } });

    await createFolder(123, "diagrams");

    expect(mockedClient.post).toHaveBeenCalledWith("/submitted_content/folder_action", {
      id: 123,
      faction: { create: "diagrams" },
    });
  });

  test("deleteFiles sends bare filenames and lets the server resolve the path", async () => {
    mockedClient.post.mockResolvedValueOnce({ data: { message: "deleted" } });

    await deleteFiles(123, ["a.pdf", "b.txt"]);

    expect(mockedClient.post).toHaveBeenCalledWith("/submitted_content/folder_action", {
      id: 123,
      faction: { delete: "true" },
      current_folder: { name: "/" },
      filenames: ["a.pdf", "b.txt"],
    });
  });

  test("surfaces the error message rendered by render_error", async () => {
    mockedClient.post.mockRejectedValueOnce({
      response: { data: { error: "You or your teammate(s) have already submitted the same hyperlink." } },
    });

    await expect(submitHyperlink(123, "https://example.com")).rejects.toThrow(
      "You or your teammate(s) have already submitted the same hyperlink."
    );
  });

  test("validateFile rejects files over the 5MB server limit", () => {
    expect(validateFile(new File([new ArrayBuffer(6 * 1024 * 1024)], "large.pdf")).valid).toBe(false);
  });

  test("validateFile rejects extensions the server does not allow", () => {
    expect(validateFile(new File(["test"], "test.exe")).valid).toBe(false);
  });

  test("validateFile accepts an allowed extension under the limit", () => {
    expect(validateFile(new File(["test"], "test.pdf")).valid).toBe(true);
  });

  test("validateUrl accepts http(s) and rejects anything else", () => {
    expect(validateUrl("https://example.com").valid).toBe(true);
    expect(validateUrl("not a url").valid).toBe(false);
    expect(validateUrl("ftp://example.com").valid).toBe(false);
  });
});
