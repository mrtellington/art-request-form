/**
 * PPTX Rise & Shine Section Component
 *
 * Displays level selection, level-specific messaging, presentation structure builder,
 * and additional content (trend shops and marketing collateral) for PPTX Rise & Shine requests.
 */

'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  FormData,
  RiseAndShineLevel,
  TrendShop,
  MarketingCollateral,
} from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, HelpCircle, ExternalLink, Trash2 } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip-simple';
import { ASANA_BOARD_URL, FOLLOW_TEMPLATE_URL } from '@/lib/constants/rise-and-shine';
import { PresentationStructure } from './PresentationStructure';

interface PPTXRiseAndShineSectionProps {
  watch: ReturnType<typeof useFormContext<FormData>>['watch'];
  setValue: ReturnType<typeof useFormContext<FormData>>['setValue'];
  errors: ReturnType<typeof useFormContext<FormData>>['formState']['errors'];
}

/**
 * Normalize URL to ensure it has a protocol
 */
function normalizeUrl(url: string): string {
  if (!url) return url;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function PPTXRiseAndShineSection({
  watch,
  setValue,
  errors,
}: PPTXRiseAndShineSectionProps) {
  const { control } = useFormContext<FormData>();
  const riseAndShineLevel = watch('riseAndShineLevel');

  // Field arrays for additional content
  const {
    fields: trendShopFields,
    append: appendTrendShop,
    remove: removeTrendShop,
    update: updateTrendShop,
  } = useFieldArray({
    control,
    name: 'trendShops',
  });

  const {
    fields: marketingCollateralFields,
    append: appendMarketingCollateral,
    remove: removeMarketingCollateral,
    update: updateMarketingCollateral,
  } = useFieldArray({
    control,
    name: 'marketingCollateral',
  });

  // Level-specific messages and requirements
  const levelInfo = {
    Bronze: {
      color: 'amber',
      title: 'Rise & Shine Bronze',
      description:
        'A Rise & Shine deck can never have a deadline that is needed. The Bronze Deck is a 5-8 Slide presentation showing 20-40 individual mockups. This deck can be completed in 12 active hours. Look at the Asana board to compose a reasonable deadline.',
      helpText:
        'Bronze decks ideally have categories for the 5-8 slides that are included. List out the slides that you would like and the product within each. Links are required to meet a 12 hour turnaround for a Bronze deck.',
    },
    Silver: {
      color: 'blue',
      title: 'Rise & Shine Silver',
      description:
        'A Rise & Shine deck can never have a deadline that is needed. The Silver Deck is a 15-30 Slide presentation showing roughly 100 individual mockups. This deck can be completed in 30 active hours. Look at the Asana board to compose a reasonable deadline. Video Call REQUIRED - FOLLOW TEMPLATE. To use this level card - the Sales Goal must be between $50K - $250K and be a CLIENT not a PROSPECT.',
      helpText:
        "Silver decks are open ended. It will always help the speed of deck creation if categories are listed out with links. At minimum, Sales should list product concepts and give a general idea of how much product they'd like to see.",
    },
    Gold: {
      color: 'yellow',
      title: 'Rise & Shine Gold',
      description:
        'A Rise & Shine deck can never have a deadline that is needed. The Gold Deck is a 50+ Slide presentation showing 200 individual mockups. This deck can be completed in 60 active hours. Look at the Asana board to compose a reasonable deadline. Video Call REQUIRED - FOLLOW TEMPLATE. To use this level card - the Sales Goal must be at least $250K and be a CLIENT not a PROSPECT.',
      helpText:
        "Gold decks are very structured. Each department within the client's business should be explored. Sales is encouraged to provide research. Deadline for a Gold Deck should be at minimum 1 month from today.",
    },
  };

  const currentLevelInfo = riseAndShineLevel ? levelInfo[riseAndShineLevel] : null;

  return (
    <div className="space-y-6">
      {/* Level Selection with Help */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="riseAndShineLevel">
            Rise & Shine Level <span className="text-red-500">*</span>
          </Label>
          <Tooltip
            content={
              <div className="space-y-3 max-w-md">
                <div>
                  <p className="font-semibold text-xs">Bronze</p>
                  <p className="text-xs">{levelInfo.Bronze.helpText}</p>
                </div>
                <div>
                  <p className="font-semibold text-xs">Silver</p>
                  <p className="text-xs">{levelInfo.Silver.helpText}</p>
                </div>
                <div>
                  <p className="font-semibold text-xs">Gold</p>
                  <p className="text-xs">{levelInfo.Gold.helpText}</p>
                </div>
              </div>
            }
          >
            <HelpCircle className="w-4 h-4 text-zinc-400 cursor-help" />
          </Tooltip>
        </div>
        <Select
          value={riseAndShineLevel || undefined}
          onValueChange={(value) =>
            setValue('riseAndShineLevel', value as RiseAndShineLevel, {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="riseAndShineLevel">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
          </SelectContent>
        </Select>
        {errors.riseAndShineLevel && (
          <p className="text-sm text-red-600 mt-2">{errors.riseAndShineLevel.message}</p>
        )}
      </div>

      {/* Level-Specific Message */}
      {currentLevelInfo && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${
            currentLevelInfo.color === 'amber'
              ? 'bg-amber-50 border-amber-200'
              : currentLevelInfo.color === 'blue'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <AlertCircle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              currentLevelInfo.color === 'amber'
                ? 'text-amber-600'
                : currentLevelInfo.color === 'blue'
                  ? 'text-blue-600'
                  : 'text-yellow-600'
            }`}
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                currentLevelInfo.color === 'amber'
                  ? 'text-amber-800'
                  : currentLevelInfo.color === 'blue'
                    ? 'text-blue-800'
                    : 'text-yellow-800'
              }`}
            >
              {currentLevelInfo.title}
            </p>
            <p
              className={`text-xs mt-1 ${
                currentLevelInfo.color === 'amber'
                  ? 'text-amber-700'
                  : currentLevelInfo.color === 'blue'
                    ? 'text-blue-700'
                    : 'text-yellow-700'
              }`}
            >
              {currentLevelInfo.description}
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href={ASANA_BOARD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium hover:underline flex items-center gap-1"
              >
                View Asana Board <ExternalLink className="w-3 h-3" />
              </a>
              {(riseAndShineLevel === 'Silver' || riseAndShineLevel === 'Gold') && (
                <a
                  href={FOLLOW_TEMPLATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium hover:underline flex items-center gap-1"
                >
                  Follow Template <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Presentation Structure - Optional */}
      {riseAndShineLevel && (
        <>
          <div className="border-t border-zinc-200 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Label>Deck Structure</Label>
              <span className="text-zinc-500 text-sm">(Optional)</span>
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              Define your slide structure with products, or describe the deck in Pertinent
              Information below.
            </p>
            <PresentationStructure />
          </div>

          {/* Additional Content Section */}
          <div className="border-t border-zinc-200 pt-6 space-y-6">
            <h3 className="text-lg font-semibold">Additional Content</h3>

            {/* Trend Shops */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Trend Shops</Label>
                <Tooltip content="Standard decks include Holiday 2025, Good for the Planet, and Best in Show 2025. Specify if a different shop should be included based on Client/Opportunity. Please add links!">
                  <HelpCircle className="w-4 h-4 text-zinc-400 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-sm text-zinc-600 mb-3">
                Standard: Holiday 2025, Good for the Planet, Best in Show 2025
              </p>

              <div className="space-y-2">
                {trendShopFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Input
                      placeholder="Shop name"
                      value={field.name}
                      onChange={(e) => {
                        const updated = { ...field, name: e.target.value };
                        updateTrendShop(index, updated);
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="https://..."
                      value={field.link}
                      onChange={(e) => {
                        const updated = { ...field, link: e.target.value };
                        updateTrendShop(index, updated);
                      }}
                      onBlur={(e) => {
                        const normalized = normalizeUrl(e.target.value);
                        if (normalized !== field.link) {
                          const updated = { ...field, link: normalized };
                          updateTrendShop(index, updated);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrendShop(index)}
                      className="flex-shrink-0 text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendTrendShop({ id: crypto.randomUUID(), name: '', link: '' })
                  }
                  className="w-full"
                >
                  Add Trend Shop
                </Button>
              </div>
            </div>

            {/* Marketing Collateral */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Marketing Collateral</Label>
                <Tooltip content="Optional slide to include links to Trend Forecast, Swag Lab articles, Sell Sheets, or Case Studies! (Please add links!)">
                  <HelpCircle className="w-4 h-4 text-zinc-400 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-sm text-zinc-600 mb-3">
                Trend Forecast, Swag Lab articles, Sell Sheets, Case Studies
              </p>

              <div className="space-y-2">
                {marketingCollateralFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Input
                      placeholder="Collateral name"
                      value={field.collateral}
                      onChange={(e) => {
                        const updated = { ...field, collateral: e.target.value };
                        updateMarketingCollateral(index, updated);
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="https://..."
                      value={field.link}
                      onChange={(e) => {
                        const updated = { ...field, link: e.target.value };
                        updateMarketingCollateral(index, updated);
                      }}
                      onBlur={(e) => {
                        const normalized = normalizeUrl(e.target.value);
                        if (normalized !== field.link) {
                          const updated = { ...field, link: normalized };
                          updateMarketingCollateral(index, updated);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMarketingCollateral(index)}
                      className="flex-shrink-0 text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendMarketingCollateral({
                      id: crypto.randomUUID(),
                      collateral: '',
                      link: '',
                    })
                  }
                  className="w-full"
                >
                  Add Marketing Collateral
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
