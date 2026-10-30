class Listing {
  const Listing({
    required this.id,
    required this.name,
    required this.slug,
    required this.category,
    required this.summary,
    required this.region,
    required this.websiteUrl,
    required this.sourceUrl,
    required this.isFeatured,
    required this.createdAt,
    this.countryCode,
    this.verifiedAt,
  });

  static const categories = {
    'community', 'convention', 'artist', 'organization', 'industry', 'resource'
  };
  static const regions = {
    'North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa'
  };
  static final _uuid = RegExp(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    caseSensitive: false,
  );
  static final _slug = RegExp(r'^[a-z0-9]+(?:-[a-z0-9]+)*$');
  static final _country = RegExp(r'^[A-Z]{2}$');

  final String id, name, slug, category, summary, region, websiteUrl, sourceUrl;
  final String? countryCode, verifiedAt;
  final bool isFeatured;
  final DateTime createdAt;

  factory Listing.fromJson(Map<String, dynamic> json) {
    String requiredString(String key, {int minLength = 1, int? maxLength}) {
      final value = json[key];
      if (value is! String || value.trim().length < minLength ||
          (maxLength != null && value.length > maxLength)) {
        throw FormatException('Invalid listing field: $key');
      }
      return value;
    }

    String httpsUrl(String key) {
      final value = requiredString(key);
      final uri = Uri.tryParse(value);
      if (uri == null || uri.scheme != 'https' || uri.host.isEmpty ||
          uri.userInfo.isNotEmpty) {
        throw FormatException('Invalid HTTPS URL: $key');
      }
      return value;
    }

    final id = requiredString('id');
    final name = requiredString('name', minLength: 2, maxLength: 120);
    final slug = requiredString('slug', maxLength: 120);
    final category = requiredString('category');
    final summary = requiredString('summary', minLength: 20, maxLength: 500);
    final region = requiredString('region');
    final country = json['country_code'];
    final verified = json['verified_at'];
    final featured = json['is_featured'];
    final created = json['created_at'];

    if (!_uuid.hasMatch(id)) throw const FormatException('Invalid listing id');
    if (!_slug.hasMatch(slug)) throw const FormatException('Invalid listing slug');
    if (!categories.contains(category)) throw const FormatException('Unsupported listing category');
    if (!regions.contains(region)) throw const FormatException('Unsupported listing region');
    if (country != null && (country is! String || !_country.hasMatch(country))) {
      throw const FormatException('Invalid country_code');
    }
    if (verified != null && (verified is! String || DateTime.tryParse(verified) == null)) {
      throw const FormatException('Invalid verified_at');
    }
    if (featured is! bool) throw const FormatException('Invalid is_featured');
    if (created is! String || DateTime.tryParse(created) == null) {
      throw const FormatException('Invalid created_at');
    }

    return Listing(
      id: id,
      name: name,
      slug: slug,
      category: category,
      summary: summary,
      region: region,
      websiteUrl: httpsUrl('website_url'),
      sourceUrl: httpsUrl('source_url'),
      countryCode: country as String?,
      verifiedAt: verified as String?,
      isFeatured: featured,
      createdAt: DateTime.parse(created),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    'category': category,
    'summary': summary,
    'region': region,
    'website_url': websiteUrl,
    'source_url': sourceUrl,
    'country_code': countryCode,
    'verified_at': verifiedAt,
    'is_featured': isFeatured,
    'created_at': createdAt.toUtc().toIso8601String(),
  };
}
