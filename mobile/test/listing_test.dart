import 'package:flutter_test/flutter_test.dart';
import 'package:furfinder_mobile/listing.dart';

void main() {
  final valid = <String, dynamic>{
    'id': '00000000-0000-4000-8000-000000000001',
    'name': 'Example Community',
    'slug': 'example-community',
    'category': 'community',
    'summary': 'A public community listing with a useful description.',
    'region': 'Asia-Pacific',
    'country_code': 'ID',
    'website_url': 'https://example.org',
    'source_url': 'https://example.org/about',
    'verified_at': null,
    'is_featured': true,
    'created_at': '2026-01-01T00:00:00.000Z',
  };

  test('parses a valid public v1 listing', () {
    final listing = Listing.fromJson(valid);
    expect(listing.name, 'Example Community');
    expect(listing.region, 'Asia-Pacific');
    expect(listing.isFeatured, isTrue);
    expect(listing.createdAt.toUtc().toIso8601String(), '2026-01-01T00:00:00.000Z');
  });

  test('rejects non-HTTPS provenance links', () {
    expect(() => Listing.fromJson({...valid, 'source_url': 'http://example.org'}),
        throwsFormatException);
  });

  test('rejects missing and out-of-range fields', () {
    final missing = {...valid}..remove('summary');
    expect(() => Listing.fromJson(missing), throwsFormatException);
    expect(() => Listing.fromJson({...valid, 'name': 'A'}), throwsFormatException);
    expect(() => Listing.fromJson({...valid, 'summary': 'Too short'}), throwsFormatException);
  });

  test('rejects invalid IDs and unsupported taxonomy values', () {
    expect(() => Listing.fromJson({...valid, 'id': 'listing-1'}), throwsFormatException);
    expect(() => Listing.fromJson({...valid, 'category': 'unknown'}), throwsFormatException);
    expect(() => Listing.fromJson({...valid, 'region': 'Unknown'}), throwsFormatException);
  });

  test('rejects malformed timestamps and non-boolean featured values', () {
    expect(() => Listing.fromJson({...valid, 'created_at': 'not-a-date'}), throwsFormatException);
    expect(() => Listing.fromJson({...valid, 'verified_at': 'not-a-date'}), throwsFormatException);
    expect(() => Listing.fromJson({...valid, 'is_featured': 'true'}), throwsFormatException);
  });

  test('cache serialization retains only public API fields', () {
    final json = Listing.fromJson(valid).toJson();
    expect(json['is_featured'], isTrue);
    expect(json.containsKey('created_at'), isTrue);
    expect(json.containsKey('phone'), isFalse);
    expect(json.containsKey('home_address'), isFalse);
  });
}
