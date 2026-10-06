import {supabase} from '../supabase/client';
import type {Product, ProductStatus} from '../../types';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  price: number | string;
  stock: number;
  low_stock_threshold: number | null;
  category_id: string | null;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  image_urls: unknown;
  brand_id: string | null;
  series_id: string | null;
  created_at: string;
}

interface NamedRow {
  id: string;
  name: string;
}

interface ProductTagRow {
  product_id: string;
  tag_id: string;
}

const requireData = <T,>(data: T[] | null, error: {message: string} | null): T[] => {
  if (error) throw new Error(error.message);
  return data || [];
};

const getProductStatus = (stock: number, lowStockThreshold: number | null): ProductStatus => {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= (lowStockThreshold ?? 3)) return 'low_stock';
  return 'active';
};

export const fetchProducts = async (): Promise<Product[]> => {
  const {data: products, error: productsError} = await supabase
    .from('products')
    .select('id,name,sku,price,stock,low_stock_threshold,category_id,description,short_description,image_url,image_urls,brand_id,series_id,created_at')
    .order('created_at', {ascending: false});

  const productRows = requireData(products as ProductRow[] | null, productsError);
  if (productRows.length === 0) return [];

  const [categoryResult, brandResult, seriesResult, productTagResult] = await Promise.all([
    supabase.from('categories').select('id,name'),
    supabase.from('brands').select('id,name'),
    supabase.from('series').select('id,name'),
    supabase.from('product_tags').select('product_id,tag_id'),
  ]);

  const categories = requireData(categoryResult.data as NamedRow[] | null, categoryResult.error);
  const brands = requireData(brandResult.data as NamedRow[] | null, brandResult.error);
  const series = requireData(seriesResult.data as NamedRow[] | null, seriesResult.error);
  const productTags = requireData(productTagResult.data as ProductTagRow[] | null, productTagResult.error);
  const tagIds = [...new Set(productTags.map(({tag_id}) => tag_id))];
  const tagResult = tagIds.length
    ? await supabase.from('tags').select('id,name').in('id', tagIds)
    : {data: [] as NamedRow[], error: null};
  const tags = requireData(tagResult.data as NamedRow[] | null, tagResult.error);

  const categoryNames = new Map(categories.map(({id, name}) => [id, name]));
  const brandNames = new Map(brands.map(({id, name}) => [id, name]));
  const seriesNames = new Map(series.map(({id, name}) => [id, name]));
  const tagNames = new Map(tags.map(({id, name}) => [id, name]));
  const tagsByProduct = new Map<string, string[]>();

  for (const productTag of productTags) {
    const tagName = tagNames.get(productTag.tag_id);
    if (!tagName) continue;
    const productTagNames = tagsByProduct.get(productTag.product_id) || [];
    productTagNames.push(tagName);
    tagsByProduct.set(productTag.product_id, productTagNames);
  }

  return productRows.map((row) => {
    const productTagNames = tagsByProduct.get(row.id) || [];
    const gallery = Array.isArray(row.image_urls)
      ? row.image_urls.filter((image): image is string => typeof image === 'string')
      : [];
    const stock = Number(row.stock) || 0;

    return {
      id: row.id,
      name: row.name,
      sku: row.sku,
      price: Number(row.price) || 0,
      image_url: row.image_url || gallery[0] || '',
      gallery,
      description: row.description || row.short_description || '',
      category_name: (row.category_id && categoryNames.get(row.category_id)) || 'Uncategorized',
      brand: row.brand_id ? brandNames.get(row.brand_id) : undefined,
      series: row.series_id ? seriesNames.get(row.series_id) : undefined,
      tags: productTagNames,
      stock,
      status: getProductStatus(stock, row.low_stock_threshold),
      featured: productTagNames.some((tag) => tag.toLowerCase() === 'featured'),
      created_at: row.created_at,
    };
  });
};