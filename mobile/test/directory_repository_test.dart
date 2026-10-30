import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:furfinder_mobile/directory_repository.dart';

void main() {
  final listing = <String, dynamic>{
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

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('fetches the same-origin v1 endpoint and caches public records', () async {
    final client = MockClient((request) async {
      expect(request.url.toString(), 'https://api.example.test/api/v1/listings');
      expect(request.headers['Accept'], 'application/json');
      return http.Response(
        jsonEncode({'ok': true, 'version': 'v1', 'data': [listing]}),
        200,
        headers: {'content-type': 'application/json'},
      );
    });
    final preferences = await SharedPreferences.getInstance();
    final repository = DirectoryRepository(
      client: client,
      preferences: preferences,
      baseUrl: 'https://api.example.test',
    );

    final results = await repository.fetchListings();
    expect(results, hasLength(1));
    expect(results.single.isFeatured, isTrue);

    final cache = await repository.readCache();
    expect(cache, isNotNull);
    expect(cache!.listings.single.name, 'Example Community');
    expect(cache.savedAt, isNotNull);
    expect(cache.listings.single.toJson().containsKey('phone'), isFalse);
    repository.dispose();
  });

  test('rejects malformed envelopes and responses over the public limit', () async {
    final malformedClient = MockClient((_) async => http.Response(
          jsonEncode({'ok': false, 'version': 'v1', 'data': [listing]}),
          200,
        ));
    final repository = DirectoryRepository(
      client: malformedClient,
      preferences: await SharedPreferences.getInstance(),
      baseUrl: 'https://api.example.test',
    );
    await expectLater(repository.fetchListings(), throwsFormatException);
    repository.dispose();

    final oversizedClient = MockClient((_) async => http.Response(
          jsonEncode({
            'ok': true,
            'version': 'v1',
            'data': List.generate(61, (_) => listing),
          }),
          200,
        ));
    final oversizedRepository = DirectoryRepository(
      client: oversizedClient,
      preferences: await SharedPreferences.getInstance(),
      baseUrl: 'https://api.example.test',
    );
    await expectLater(oversizedRepository.fetchListings(), throwsFormatException);
    oversizedRepository.dispose();
  });

  test('returns an error for unsuccessful API responses', () async {
    final client = MockClient((_) async => http.Response('unavailable', 503));
    final repository = DirectoryRepository(
      client: client,
      preferences: await SharedPreferences.getInstance(),
      baseUrl: 'https://api.example.test',
    );
    await expectLater(repository.fetchListings(), throwsException);
    repository.dispose();
  });

  test('reads saved public metadata for offline mode', () async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString('furfinder.public_listings.v1', jsonEncode({
      'saved_at': '2026-01-02T00:00:00.000Z',
      'listings': [listing],
    }));
    final repository = DirectoryRepository(
      client: MockClient((_) async => http.Response('', 500)),
      preferences: preferences,
      baseUrl: 'https://api.example.test',
    );

    final cache = await repository.readCache();
    expect(cache, isNotNull);
    expect(cache!.listings.single.id, listing['id']);
    expect(cache.savedAt, DateTime.parse('2026-01-02T00:00:00.000Z'));
    repository.dispose();
  });
}
