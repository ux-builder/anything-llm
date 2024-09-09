import { useEffect, useState } from "react";
import { Info, CaretDown, CaretUp } from "@phosphor-icons/react";
import paths from "@/utils/paths";
import System from "@/models/system";
import PreLoader from "@/components/Preloader";
import { LMSTUDIO_COMMON_URLS } from "@/utils/constants";
import useProviderEndpointAutoDiscovery from "@/hooks/useProviderEndpointAutoDiscovery";
import { useTranslation } from "react-i18next";

export default function LMStudioOptions({ settings, showAlert = false }) {
  const { t } = useTranslation();
  const {
    autoDetecting: loading,
    basePath,
    basePathValue,
    showAdvancedControls,
    setShowAdvancedControls,
    handleAutoDetectClick,
  } = useProviderEndpointAutoDiscovery({
    provider: "lmstudio",
    initialBasePath: settings?.LMStudioBasePath,
    ENDPOINTS: LMSTUDIO_COMMON_URLS,
  });

  const [maxTokens, setMaxTokens] = useState(
    settings?.LMStudioTokenLimit || 4096
  );

  const handleMaxTokensChange = (e) => {
    setMaxTokens(Number(e.target.value));
  };

  return (
    <div className="w-full flex flex-col gap-y-7">
      {showAlert && (
        <div className="flex flex-col md:flex-row md:items-center gap-x-2 text-white mb-6 bg-blue-800/30 w-fit rounded-lg px-4 py-2">
          <div className="gap-x-2 flex items-center">
            <Info size={12} className="hidden md:visible" />
            <p className="text-sm md:text-base">
              {t("llmPreference.lmstudio.alertMessage")}
            </p>
          </div>
          <a
            href={paths.settings.embedder.modelPreference()}
            className="text-sm md:text-base my-2 underline"
          >
            {t("llmPreference.lmstudio.manageEmbedding")} &rarr;
          </a>
        </div>
      )}
      <div className="w-full flex items-start gap-[36px] mt-1.5">
        <LMStudioModelSelection settings={settings} basePath={basePath.value} />
        <div className="flex flex-col w-60">
          <label className="text-white text-sm font-semibold block mb-2">
            {t("llmPreference.lmstudio.maxTokens")}
          </label>
          <input
            type="number"
            name="LMStudioTokenLimit"
            className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            placeholder="4096"
            defaultChecked="4096"
            min={1}
            value={maxTokens}
            onChange={handleMaxTokensChange}
            onScroll={(e) => e.target.blur()}
            required={true}
            autoComplete="off"
          />
          <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
            {t("llmPreference.lmstudio.maxTokensDescription")}
          </p>
        </div>
      </div>
      <div className="flex justify-start mt-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowAdvancedControls(!showAdvancedControls);
          }}
          className="text-white hover:text-white/70 flex items-center text-sm"
        >
          {showAdvancedControls
            ? t("llmPreference.lmstudio.hideAdvancedControls")
            : t("llmPreference.lmstudio.showAdvancedControls")}
          {showAdvancedControls ? (
            <CaretUp size={14} className="ml-1" />
          ) : (
            <CaretDown size={14} className="ml-1" />
          )}
        </button>
      </div>

      <div hidden={!showAdvancedControls}>
        <div className="w-full flex items-start gap-4">
          <div className="flex flex-col w-60">
            <div className="flex justify-between items-center mb-2">
              <label className="text-white text-sm font-semibold">
                {t("llmPreference.lmstudio.baseUrlLabel")}
              </label>
              {loading ? (
                <PreLoader size="6" />
              ) : (
                <>
                  {!basePathValue.value && (
                    <button
                      onClick={handleAutoDetectClick}
                      className="bg-primary-button text-xs font-medium px-2 py-1 rounded-lg hover:bg-secondary hover:text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
                    >
                      {t("llmPreference.lmstudio.autoDetect")}
                    </button>
                  )}
                </>
              )}
            </div>
            <input
              type="url"
              name="LMStudioBasePath"
              className="bg-zinc-900 text-white placeholder:text-white/20 text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
              placeholder="http://localhost:1234/v1"
              value={basePathValue.value}
              required={true}
              autoComplete="off"
              spellCheck={false}
              onChange={basePath.onChange}
              onBlur={basePath.onBlur}
            />
            <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
              {t("llmPreference.lmstudio.enterUrl")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LMStudioModelSelection({ settings, basePath = null }) {
  const { t } = useTranslation();
  const [customModels, setCustomModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function findCustomModels() {
      if (!basePath) {
        setCustomModels([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { models } = await System.customModels(
          "lmstudio",
          null,
          basePath
        );
        setCustomModels(models || []);
      } catch (error) {
        console.error(t("llmPreference.lmstudio.fetchError"), error);
        setCustomModels([]);
      }
      setLoading(false);
    }
    findCustomModels();
  }, [basePath, t]);

  if (loading || customModels.length == 0) {
    return (
      <div className="flex flex-col w-60">
        <label className="text-white text-sm font-semibold block mb-2">
          {t("llmPreference.lmstudio.modelLabel")}
        </label>
        <select
          name="LMStudioModelPref"
          disabled={true}
          className="bg-zinc-900 border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
        >
          <option disabled={true} selected={true}>
            {!!basePath
              ? t("llmPreference.lmstudio.loadingModels")
              : t("llmPreference.lmstudio.enterUrlFirst")}
          </option>
        </select>
        <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
          {t("llmPreference.lmstudio.modelDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-60">
      <label className="text-white text-sm font-semibold block mb-2">
        {t("llmPreference.lmstudio.modelLabel")}
      </label>
      <select
        name="LMStudioModelPref"
        required={true}
        className="bg-zinc-900 border-gray-500 text-white text-sm rounded-lg block w-full p-2.5"
      >
        {customModels.length > 0 && (
          <optgroup label={t("llmPreference.lmstudio.availableModels")}>
            {customModels.map((model) => {
              return (
                <option
                  key={model.id}
                  value={model.id}
                  selected={settings.LMStudioModelPref === model.id}
                >
                  {model.id}
                </option>
              );
            })}
          </optgroup>
        )}
      </select>
      <p className="text-xs leading-[18px] font-base text-white text-opacity-60 mt-2">
        {t("llmPreference.lmstudio.modelDescription")}
      </p>
    </div>
  );
}
